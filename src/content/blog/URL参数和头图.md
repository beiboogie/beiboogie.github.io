---
title: 免费素材图片不完美？——利用 URL 参数优雅地调教博客头图
publishDate: 2026-04-17
slug: image-url-parameter
description: 通过几个简单的 URL 参数，让 Unsplash 或是任何支持动态处理的图片变成想要的样子
tags:
  - 博客搭建
hide_comment: false
hidden: false
language: 中文
heroImage:
  src: https://images.unsplash.com/vector-1762989121782-f2cdae7fa406?w=1600&h=400&fit=fill&bg=e2dbc8&fill=solid
  inferSize: true
  color: "#fec66d"
---

我的博客从Hexo迁移到Astro，主要是考虑到Astro的群岛结构的高效，以及看中这个pure主题的美观。不过pure主题的头图在默认情况下是长度撑满容器的，因此需要3:1甚至更长的头图才适合。  
可是在Unsplash上是很难找到如此宽比例的图片的。就算能找到，在Unsplash，Pexels这些平台上大都只能筛选是Horizontal还是Vertical的图片，不能选具体比例。

好图片很多，完美图片少，所以解决方案是：**在 URL 里写参数，让图片变成想要的样子。**

## 什么是 URL 参数？

很多现代图片服务（包括 Unsplash 背后用的 imgix 引擎）都支持动态图像处理。这意味着你不需要打开 Photoshop 费劲地切图、导出、上传，你只需要在图片地址后面打几个“补丁”。

这篇文章的头图就是一个完美的例子。

### 举例

拆解一下本文的 Hero Image 地址：

```text
https://images.unsplash.com/...f2cdae7fa406?w=1600&h=400&fit=fill&bg=e2dbc8&fill=solid
```

参数如下：

* **`w=1600&h=400`**：指定输出的分辨率。确保浏览器下载的就是 4:1 比例的素材。
* **`fit=fill`**：让图片居中放置
* **`bg=e2dbc8`**：既然 `fit=fill` 会在图片两侧或上下留下空白，那么这个参数就指定了空白处填充的颜色（Hex 格式）。
* **`fill=solid`**：配合上面的背景色，实现纯色填充。

### 关于fit参数

fit参数有两个值：crop和fill

| 参数 | 功能描述 | 建议场景 |
| :--- | :--- | :--- |
| `fit=crop` | **裁剪**。切掉多余部分，填满框。 | 主体位于正中央，且背景不重要的图片。 |
| `fit=fill` | **填充**。完整显示原图，用背景色补齐空位。 |用于 Logo、图标或风格明显的插画。 |


## 实战演示

```html title="添加宽度信息"
<img src="https://images.unsplash.com/vector-1762989121782-f2cdae7fa406?w=800" >
```

<img src="https://images.unsplash.com/vector-1762989121782-f2cdae7fa406?w=800" 
     alt="cat" 
     style="border-radius: 20px; display: block; margin: 0 auto;width: 90%">

```html title="fit=crop"
<img src="https://images.unsplash.com/vector-1762989121782-f2cdae7fa406?w=800&h=200&fit=crop"  >
```

<img src="https://images.unsplash.com/vector-1762989121782-f2cdae7fa406?w=800&h=200&fit=crop" 
     alt="cat" 
     style="border-radius: 20px; display: block; margin: 0 auto;width: 90%">

```html title="fit=fill 并添加蓝色背景"
<img src="https://images.unsplash.com/vector-1762989121782-f2cdae7fa406?w=800&h=200&fit=fill&bg=4a768c&fill=solid" >
```

<img src="https://images.unsplash.com/vector-1762989121782-f2cdae7fa406?w=800&h=200&fit=fill&bg=4a768c&fill=solid" 
     alt="cat" 
     style="border-radius: 20px; display: block; margin: 0 auto;width: 90%">


```html title="换成合适的背景颜色"
<img src="https://images.unsplash.com/vector-1762989121782-f2cdae7fa406?w=800&h=200&fit=fill&bg=e2dbc8&fill=solid" >
```

<img src="https://images.unsplash.com/vector-1762989121782-f2cdae7fa406?w=800&h=200&fit=fill&bg=e2dbc8&fill=solid" 
     alt="cat" 
     style="border-radius: 20px; display: block; margin: 0 auto;width: 90%">

---

## 总结

当你掌握了这些简单的字符组合，下次在写 `heroImage` 的时候，那些原本没法用的照片，就可以轻松适配需求了。
