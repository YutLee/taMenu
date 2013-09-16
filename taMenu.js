(function() {
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
					play, isB = false, isFirst = true, isOnFirstMenu = false, isOnSecondMenu = false,
					cache = [],
					TIMEOUT = 10;
					
				oneMenu.bind({
					'mouseenter': function() {
						isOnFirstMenu = true;
						setTimeout(function() {
							if(isFirst) {
								twoMenu.animate({width: o.width}, 200);
							}
						}, TIMEOUT);
					},
					'mouseleave': function() {
						leavePointX = null;
						leavePointY = null;
						clearTimeout(play);
						isOnFirstMenu = false;
						setTimeout(function() {
							onLeave(isOnSecondMenu);
						}, TIMEOUT);			
					}
				});
				
				firstMenu.bind({
					'mouseenter': function(e) {
						onFrist($(this), e);
					},
					'mousemove': function(e) {
						cache.push([e.pageY, e.pageX]);
					}
				});
				
				twoMenu.bind({
					'mouseenter': function() {
						isOnSecondMenu = true;
					},
					'mouseleave': function() {
						isOnSecondMenu = false;
						setTimeout(function() {
							onLeave(isOnFirstMenu);
						}, TIMEOUT);
					}
				});
				
				leaveNode();
				
				function onLeave(isOnMenu) {
					if(!isOnMenu) {
						var idx = -1;
						firstMenu.each(function(index) {
							if($(this).hasClass('chose')) {
								$(this).removeClass('chose');
								idx = index;
							}
						});
						secondMenu.eq(idx).hide();
						twoMenu.css({'width': 0});
						isFirst = true;
					}else {
						isFirst = false;
					}
				}
				
				function leaveNode() {
					firstMenu.bind({
						'mouseleave': function(e) {
							leaveFirst($(this), e);
						}
					});
				}
				
				function onFrist(el, e) {
					var idx = el.index(),
						ul = secondMenu.eq(idx);

					var farthestTopX = twoMenu.offset().left,
						farthestTopY = twoMenu.offset().top,
						farthestBottomX = farthestTopX,
						farthestBottomY = twoMenu.offset().top + twoMenu.outerHeight(),
						buffer;
					clearTimeout(play);
					if (isBuffer(e, el, leavePointX, leavePointY, farthestTopX, farthestTopY, farthestBottomX, farthestBottomY)) {
						isB = true;
						firstMenu.unbind('mouseleave');

						play = setTimeout(function() {
							if(!isOnSecondMenu) {
								el.addClass('chose').siblings('.chose').removeClass('chose');
								ul.show().siblings().hide();
								leaveNode();
							}
						}, o.delay);
					}else {
						isB = false;
						leaveNode();
						el.addClass('chose').siblings('.chose').removeClass('chose');
						ul.show().siblings().hide();
					}
					if(leavePointX == null || leavePointY == null) {
						isB = true;
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
				
			});
		};

	})();