---
title: Hexo博客写作工作流——用Obsidian实现一站式图片和属性管理
id: hexo-obsidian-blog
date: 2025-11-3
categories:
tags:
  - 知识
  - 博客搭建
featured_image:
hide_comment: false
---

--目录--
<!-- toc -->

> 2025-11-07：在这篇文章里介绍了更完美的图片插入方法，也是基于Obsidian插件。

{% post_link  博客的图片一站式压缩、格式、路径、引用方案——基于ImageConverter 博客的图片一站式压缩、格式、路径、引用方案——基于ImageConverter %}

## 开始之前

本文介绍基于 Hexo + Obsidian 的博客写作工作流。在阅读本文前，建议您已完成以下准备：

- 配置环境
    - 安装 Git
    - 安装 Node.js
- 开始使用 Hexo
    - 安装 Hexo
    - 应用主题
    - 配置主题设置

非必需但推荐完成的内容：[Hexo 提供的一键部署](https://hexo.io/zh-cn/docs/one-command-deployment)  
同时，本文的逻辑`也许大概`会有些跳脱，但重点在于方法论的分享，希望理解。

## 最终效果

按照下文方法配置后，完整的写作流程可简化为：

1. 打开 Obsidian，进入 `_posts` 文件夹
2. 开始写作
    1. 使用快捷键新建文章
    2. 填写标题
    3. 使用快捷键应用模板
    4. 填写文章属性
    5. 撰写内容，利用 `Attachment Management` 插件实现“复制粘贴”式图片插入
3. 执行 `hexo clean && hexo d` 完成部署

## 准备和思路

将 Hexo 根目录添加为 Obsidian 仓库。如果你使用 [Hexo 提供的一键部署](https://hexo.io/zh-cn/docs/one-command-deployment)，则无需额外调整，也无需修改 `.gitignore` 文件。

整体思路是：**利用 Obsidian 强大的自定义功能去适配 Hexo 的框架**，充分发挥 Hexo 与 Obsidian 各自的优势。`这也是为什么未采用许多其他经验分享中推荐的 Obsidian Git 插件——因为 Hexo 的一键部署已经足够便捷。`

## 图片（附件）管理

Hexo 支持统一附件管理，也支持为每篇文章单独设置附件文件夹。推荐后者，便于后续维护。

首先，在 Hexo 的 `_config.yml` 中找到以下配置：

``` yml
post_asset_folder: false
```

将其修改为：

``` yml
post_asset_folder: true  
marked:  
prependRoot: true  
postAsset: true
```

修改后，每次执行 `hexo new 文章名` 时，Hexo 会在 `_posts` 文件夹中创建文章文件及对应的同名文件夹。（你也可以手动完成此过程，效果是一样的。）

Hexo 要求将文章所需图片放在该同名文件夹中，并在文章中通过 `![图片描述](图片名.png)` 格式插入图片。如果你曾使用 Typora 或 Obsidian，可能会注意到这与它们的图片插入逻辑有所不同。**因此我们需要借助插件来适配 Hexo 的框架。**

网络上很多人推荐的 `Custom Attachment Location` 插件在我的环境中会出现内存泄漏，原因未知。  
但偶然间，我发现了一个更合适的插件：`Attachment Management`。安装并启用后，其默认配置恰好符合上述 Hexo 框架的要求。

![](IMG-20251105143232744.png)

启用插件后，你可以在任意位置复制图片，并通过 Ctrl+V 粘贴到文章相应位置。插件会自动将图片重命名为`你可设置的格式`，并存储在同名文件夹中，同时弹出提示。引用格式也会自动调整为正确形式：

![](IMG-20251105143725251.png)

## 属性管理

无需安装额外插件。由于 Obsidian 原生支持以 YAML 格式书写 Front-matter 作为属性管理，你只需使用 Obsidian 自带的模板功能即可实现。

在根目录下创建一个 Obsidian 模板文件夹（如 `Template`），并添加文件 `BlogTemplate.md`。在该文件中编写 Front-matter 后，即可在 Obsidian 中通过属性栏管理文章属性。

当然，模板的功能远不止于此。你还可以在正文中添加常用内容。例如，我的博客使用了 [hexo-toc](https://github.com/bubkoo/hexo-toc) 插件为每篇文章开头添加目录，因此我的模板文件如下：

``` yml
---  
title: "{{title}}"  
id:  
date: "{{date}} {{time}}"  
categories:  
tags:  
featured_image:  
---  
# 以上为 YAML 属性部分  
  
--目录--  
<!-- toc -->  
# 以上为正文部分，每篇文章均会包含
```
效果如下：

![](IMG-20251105141325235.png)

之后每次撰写新文章时，只需新建文件、填写标题、应用模板，`title` 和 `date` 信息将自动填充，其余属性也可通过 Obsidian 提供的友好界面进行编辑。

以本文为例，在 Obsidian 中应用模板后的界面如下：

![](IMG-20251105143620715.png)

至此，今后的博客写作体验，就与使用 Obsidian 记笔记一样自然。

## 结尾

如你所见，我希望打造一个极简的博客。  
我希望它界面简洁，读起来像一份报纸；功能纯粹，没有花哨装饰。  
现在，它写起来也很自在，让我能够全然专注于眼前的文字。

> 希望本文能帮助你提升 Hexo X Obsidian 博客搭建体验。