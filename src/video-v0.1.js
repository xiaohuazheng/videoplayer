/*
 * $(selector).initVideoPlayer();
 * 不支持自动播放-想了下，用播放器样式的一般都不自动播放，影响用户体验。
 * 不支持video的浏览器直接return
 */

;(function($, window, document, undefined) {
	var ua = navigator.userAgent,
		onMobile = 'ontouchstart' in window,
		eStart = onMobile ? 'touchstart' : 'mousedown',
		eMove = onMobile ? 'touchmove' : 'mousemove',
		eEnd = onMobile ? 'touchend' : 'mouseup',
		eCancel = onMobile ? 'touchcancel' : 'mouseup';

	$.fn.initVideoPlayer = function() {
		// 遍历处理video
		this.each(function() {
			if ($(this).prop('tagName').toLowerCase() !== 'video') {
				return;
			}

			var $this = $(this),
				file = $this.attr('src'),
				isSupport = false;

			if (canFilePlay(file)) {
				isSupport = true;
			} else {
				$this.find('source').each(function() {
					if (canFilePlay($(this).attr('src'))) {
						isSupport = true;
						return false;
					}
				});
			}

			if (!isSupport) {
				return;
			}

			// 添加播放器盒子
			var $player = $('<div class="ppq-video-player"><div class="screen-box">'+ $('<div>').append($this.eq(0).clone()).html() +'</div></div>'),
				videoEle = $player.find('video')[0];

			$player.find('.screen-box').append('<span class="player-loading"></span>\
                <div class="play-btn" style="display: none;">\
                    <button>\
                        <span>\
                            <svg xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 36 36"><path d="M11,10 L18,13.74 18,22.28 11,26 Z M18,13.74 L26,18 26,18 18,22.28 Z"></path></svg>\
                        </span>\
                    </button>\
                </div>');
			$player.append('<div class="tool-box tool-box-hide">\
                <div class="play-pause-btn paused"></div>\
                <div class="player-time-current">00:00</div>\
                <div class="player-time-duration">00:00</div>\
                <div class="player-enlarge-btn"></div>\
                <div class="player-bar">\
                    <div class="player-bar-loaded">\
                        <span class="player-bar-dot"></span>\
                    </div>\
                </div>\
            </div>');

			var timerToolBar = null;

    		var $video = $player.find('.ppq-video'),
				$ppBtn = $player.find('.play-pause-btn'),
				$playBtn = $player.find('.play-btn'),
				$loading = $player.find('.player-loading'),
				$toolBox = $player.find('.tool-box'),
				$current = $player.find('.player-time-current'),
				$duration = $player.find('.player-time-duration'),
				$loaded = $player.find('.player-bar-loaded'),
				$bar = $player.find('.player-bar'),
				$enlarge = $player.find('.player-enlarge-btn'),
				$dot = $player.find('.player-bar-dot');

			$duration.html('&hellip;');
			initVideoEvents();
			bindPageEvents();
			$this.replaceWith($player);

			// 如果 video 加了 x5-video-player-type="h5" android x5浏览器会自动全屏，需要把自定义的全屏切换按钮隐藏
			if ($video.attr('x5-video-player-type') === 'h5' && !!ua.match(/android/i) && ua.indexOf('MQQBrowser') > -1) {
	          	$enlarge.hide();
	       	}

			function initVideoEvents() {
				// 视频播放中
				videoEle.addEventListener('playing', function () {
		            $video.show();
		            $ppBtn.removeClass('paused').addClass('playing');
		            $playBtn.hide();
		            $loading.hide();
		            if ($.isNumeric(videoEle.duration)) {
		                $duration.text(convertTimeStr(videoEle.duration));
		            }
		            showToolBar();
		        });
		        // 视频播放完
		        videoEle.addEventListener('ended', function () {
		            exitFullscreen();
		            $video.hide();
		            $ppBtn.removeClass('playing').addClass('paused');
		            $playBtn.show();
		            $loading.hide();
		        });
		        // 视频暂停
		        videoEle.addEventListener('pause', function () {
		            $video.show();
		            $playBtn.show();
		            $loading.hide();
		        });
		        // 视频数据加载后
		        videoEle.addEventListener('loadeddata', function () {
		            if ($.isNumeric(videoEle.duration)) {
		                $duration.text(convertTimeStr(videoEle.duration));
		            }
		        });
		        // 视频时长改变
		        videoEle.addEventListener('durationchange', function () {
		            if ($.isNumeric(videoEle.duration)) {
		                $duration.text(convertTimeStr(videoEle.duration));
		            }
		        });
		        // 时间更新
		        videoEle.addEventListener('timeupdate', function () {
		            $current.text(convertTimeStr(videoEle.currentTime));
		            var percent = videoEle.currentTime / videoEle.duration * 100;
		            percent = percent > 100 ? 100 : (percent < 0 ? 0 : percent);
		            $loaded.width(percent + '%');
		        });
		        // 视频退出全屏 对应有webkitEnterFullscreen 
		        videoEle.addEventListener('webkitendfullscreen', function () {
		            if (videoEle.paused === true) {
		                $video.hide();
		                $playBtn.show();
		                $ppBtn.removeClass('playing').addClass('paused');
		            }
		        });
		        
		        // 一开始黑屏，loading状态。一秒后展示
		        setTimeout(function() {
		            $video.removeClass('video-hidden');
		            $loading.hide();
		            $playBtn.show();
		        }, 1000);
			}

			function bindPageEvents() {
				// 点击屏幕弹出控制条
				$player.on('click', function(e) {
					showToolBar(e);
				});

		        // 视频中央播放按钮
		        $playBtn.on('click', function() {
					videoEle.play();
		            $video.show();
		            $playBtn.hide();
		            $loading.hide();
				});

		        // 控制条播放暂停按钮
				$ppBtn.on('click', function(e) {
					togglePlay();
				});

				// 全屏按钮
				$enlarge.on('click', function() {
					toggleFullScreen();
				});

				// 进度条监听点击拖拉
				$bar.on(eStart, function(e) {
					var percent = 0,
						renderBarTime = function (evt) {
							var et = onMobile ? event.changedTouches[0] : evt,
								ratio = (et.clientX - $bar.offset().left) / $bar.width();
				            	
				            percent = ratio * 100;
				            percent = percent > 100 ? 100 : (percent < 0 ? 0 : percent);
				            $loaded.width(percent + '%');
				            videoEle.currentTime = ratio * videoEle.duration;
						}

		            renderBarTime(e);

					$bar.on(eMove, function(e) {
						$playBtn.hide();
			            $loading.show();

			            renderBarTime(e);
					});

					$bar.on(eEnd, function(e) {
						$loading.hide();
						if (percent < 100) {
							videoEle.play();
						}
					});
				}).on(eCancel, function() {
					$bar.unbind(eMove);
				});
			}

			function showToolBar(e) {
				if (e && e.target && e.target.nodeName === 'VIDEO' && !$toolBox.hasClass('tool-box-hide')) {
		            $toolBox.addClass('tool-box-hide');
		        } else {
		            $toolBox.removeClass('tool-box-hide');
		        }
		        clearTimeout(timerToolBar);
		        timerToolBar = setTimeout(function() {
		            $toolBox.addClass('tool-box-hide');
		        }, 2000);
			}

			function togglePlay() {
		        if ($ppBtn.hasClass('playing')) {
		            videoEle.pause();
		            $ppBtn.removeClass('playing').addClass('paused');
		        } else {
		            videoEle.play();
		            $ppBtn.removeClass('paused').addClass('playing');
		        }
		    }

		    function toggleFullScreen() {
		        if (document.webkitIsFullScreen) {
		            exitFullscreen();
		        } else {
		            enterFullScreen();
		        }
		    }
		    function enterFullScreen() {
		        if (!!ua.match(/android/i) && ua.indexOf('Chrome') > -1) {
		            screenfull.request($player[0]);
		        } else {
		            if (videoEle.requestFullscreen) {
		                videoEle.requestFullscreen();
		            } else if (videoEle.webkitEnterFullScreen) {
		                videoEle.webkitEnterFullScreen();
		            } else if (videoEle.mozRequestFullScreen) {
		                videoEle.mozRequestFullScreen();
		            } else if (videoEle.webkitRequestFullScreen) {
		                videoEle.webkitRequestFullScreen();
		            }
		        }
		    }
		});
		return this;
	}

	// 秒转为时间字符串
	function convertTimeStr(secs) {
		var m = Math.floor(secs / 60),
            s = Math.floor(secs - m * 60);
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
	}

	// 判断文件能不能播放
	function canFilePlay(file) {
		if (!file) {
			return false;
		}
		var media = document.createElement('video');
		if (typeof media.canPlayType !== 'function') {
			return false;
		}

		var res = media.canPlayType('video/' + file.split('.').pop().toLowerCase());
		return res === 'probably' || res === 'maybe';
	}

	function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen()
        }
    }
})(jQuery, window, document);