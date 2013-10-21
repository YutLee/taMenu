(function($) {
	$.fn.taMenu = function(options) {
		var o = $.extend({
			oneMenu: '#oneMenu', 
			twoMenu: '#twoMenu',
			chose: 'chose',
			delay: 300,
			width: 400
		}, options);
		
		return this.each(function() {
			var $t = $(this),
				oneMenu = $t.find(o.oneMenu),
				twoMenu = $t.find(o.twoMenu),
				firstMenu = oneMenu.find('.list'),
				secondMenu = twoMenu.find('.list'),
				leavePointX = null, leavePointY = null,
				play, isFirst = true, isOnSecondMenu = false,
				cache = [];
				
			function hide() {
				twoMenu.css({width: 0});
				var now = oneMenu.find('.chose'),
					idx = now.index();
				now.removeClass('chose');
				secondMenu.eq(idx).hide();
				leavePointX = null;
				leavePointY = null;
			}

			function onFrist(el, e) {
				var idx = el.index(),
					ul = secondMenu.eq(idx);

				var farthestTopX = twoMenu.offset().left,
					farthestTopY = twoMenu.offset().top,
					farthestBottomX = farthestTopX,
					farthestBottomY = twoMenu.offset().top + twoMenu.outerHeight(),
					buffer;
				
				if (isBuffer(e, el, leavePointX, leavePointY, farthestTopX, farthestTopY, farthestBottomX, farthestBottomY)) {
					play = setTimeout(function() {
						if(!isOnSecondMenu) {
							el.addClass('chose').siblings('.chose').removeClass('chose');
							ul.show().siblings().hide();
						}
					}, o.delay);
				}else {
					if(isFirst) { 
						twoMenu.animate({width: o.width}, 200);
					}
					el.addClass('chose').siblings('.chose').removeClass('chose');
					ul.show().siblings().hide();
					
				}
			}
			
			function leaveFirst(el, e) {
				var all = cache,
					middY = el.offset().top + (el.outerHeight()) * .5,
					len = all.length;
				cache = [];

				if(len <= 0) {
					return false;
				}
				all.sort(function(a, b) {return a[0] - b[0];});
				
				if(all[len-1][0] <= middY) {
					leavePointX = all[len-1][1];
					leavePointY = middY;
				}else if(all[0][0] >= middY) {
					leavePointX = all[0][1];
					leavePointY = middY;
				}else {
					leavePointX = all[Math.ceil(len * .5)][1];
					leavePointY = middY;
				}
				$('#m').css({'top': leavePointY - 102, 'left': leavePointX - 102});
			}

			/**
			 * 求出鼠标离开当前节点进入下个节点时需要延迟的区域（直线方程 y-y0=k*(x-x0)）
			 * @param {Element} nextNode 下个节点
			 * @param {number} leaveX 离开点 X 坐标
			 * @param {number} leaveY 离开点 Y 坐标
			 * @param {number} farthestTopX 鼠标离开点上面的最远点 X 坐标
			 * @param {number} farthestTopY 鼠标离开点上面的最远点 Y 坐标
			 * @param {number} farthestBottomX 鼠标离开点下面的最远点 X 坐标
			 * @param {number} farthestBottomY 鼠标离开点下面的最远点 Y 坐标
			 * @return {boolean} true 表示在三角区域内 
			 */
			function isBuffer(e, nextNode, leaveX, leaveY, farthestTopX, farthestTopY, farthestBottomX, farthestBottomY) {
				var pageX = e.pageX,
					pageY = e.pageY,
					minY = nextNode.offset().top,
					maxY = minY + nextNode.outerHeight(),
					minX, maxX, k,
					onLinePonitY;
				if(leaveX == null || leaveY == null) {
					return false;
				}
				if(pageY < leaveY) {//最远点取鼠标离开点上面的点
					k = (farthestTopY - leaveY) / (farthestTopX - leaveX);
					onLinePonitY = k * (pageX - leaveX) + leaveY;
					return pageY >= onLinePonitY ? true : false;
				}else if(pageY > leaveY) {//最远点取鼠标离开点下面的点
					k = (leaveY - farthestBottomY) / (leaveX - farthestBottomX);
					onLinePonitY = k * (pageX - leaveX) + leaveY;
					return pageY < onLinePonitY ? true : false;
				}
			}
			
			oneMenu.bind({
				'mouseenter': function() {
					isFirst = false;
				},
				'mouseleave': function() {
					isFirst = true;
				},
				'mousemove': function() {
					isFirst = false;
					return false;
				}
			});
			
			firstMenu.not(firstMenu.last()[0]).bind({
				'mouseenter': function(e) {
					onFrist($(this), e);
				},
				'mousemove': function(e) {
					cache.push([e.pageY, e.pageX]);
				},
				'mouseleave': function(e) {
					clearTimeout(play);
					leaveFirst($(this), e);
				}
			});
			
			firstMenu.last().bind({
				'mouseenter': function() {
					return false;
				},
				'mousemove': function() {
					return false;
				}
			});
			
			twoMenu.bind({
				'mouseenter': function() {
					isOnSecondMenu = true;
					isFirst = false;
				},
				'mouseleave': function() {
					isOnSecondMenu = false;
					isFirst = true;
				},
				'mousemove': function() {
					return false;
				}
			});
			
			$(document).bind({
				'mousemove': function() {
					hide();
				}
			});
			
		});
	};

})(jQuery);