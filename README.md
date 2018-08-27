# videoplayer
mobile h5 video player with DIY style based on jquery

### DIY

本文基于HTML5 Video API，自定义Web视频播放器样式。

其实吧，原生的video 标签样式挺好看的，但每个人的视觉感受不一样，所以就会有需要改变原生样式的时候。

那就给它化个妆咯。淡妆，淡妆。

    <video class="ppq-video video-hidden" src="https://zhuanjia4v-1252768022.cossh.myqcloud.com/hualv/437D2592787911E8862FD89EF30F789D.mp4"
           webkit-playsinline="true"
           playsinline="true"
           x-webkit-airplay="allow" // 使video支持ios的AirPlay功能，需要终端支持
           x5-playsinline 
           poster="https://img02.sogoucdn.com/app/a/200692/42345752787911E8BB8FD89EF30F789D?m-wh=960*540" 
        ></video>

添加playsinline属性：

    webkit-playsinline="true"
    playsinline="true"
    x5-playsinline 

这个playsinline属性是让video内敛到浏览器webview里面，而不使用浏览器自己实现的video样式，但是有的浏览器不认这个，就是强制要用自己的。比如UC，你要用的话就需要它给你配置白名单。有的浏览器就是不支持，白名单都没有。

关于腾讯的x5等浏览器的这些属性可以看他们的文章[【腾讯浏览服务-H5同层播放器接入规范】][7]

### 资料

[Video/Audio][2]

[HTML/Element/video][3]

[Media_events][4]

### Use

    $(selector).initVideoPlayer();  // select 为video元素

播放器样式在项目的demo文件夹有单独的css，可根据需要改成自己喜欢的样子，或者你产品经理喜欢的样子。

### DEMO

[来个demo][5]，PC 打开为移动端模式。

手机扫描二维码：

![audio-player][6]


  [1]: https://github.com/xiaohuazheng/videoplayer
  [2]: https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Video_and_audio_content
  [3]: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video
  [4]: https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
  [5]: /demos/2018-07-28-video-player-demo.html
  [6]: /img/qrCode/video-player.png
  [7]: https://x5.tencent.com/tbs/guide/video.html



