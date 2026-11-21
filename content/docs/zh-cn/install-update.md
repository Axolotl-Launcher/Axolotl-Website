---
title: "怎么安装启动器和更新启动器"
description: "注：如果您在这份教程中遇到任何问题，请查询《常见使用问题》"
locale: "zh-CN"
slug: "install-update"
group: "快速教程"
order: 7
updatedAt: "2026-11-14T03:57:51.000Z"
---

# 01 · 安装与更新

注：如果您在这份教程中遇到任何问题，请查询《常见使用问题》

## 我要下载哪个文件？

先确认自己的系统，再选对应后缀名：

<table><tbody>
<tr>
<td>

系统

</td>
<td>

下载

</td>
</tr>
<tr>
<td>

Windows 10 / 11 \(x64\)

</td>
<td>

`.exe`（NSIS 安装程序）

</td>
</tr>
<tr>
<td>

macOS \(Intel / Apple Silicon\)

</td>
<td>

`.dmg` 通用镜像

</td>
</tr>
<tr>
<td>

Debian / Ubuntu

</td>
<td>

`.deb`

</td>
</tr>
<tr>
<td>

RedHat / Fedora

</td>
<td>

`.rpm`

</td>
</tr>
<tr>
<td>

Arch Linux

</td>
<td>

AUR：`axolotl-launcher`（源码）/ `axolotl-launcher-bin`（预编译）

</td>
</tr>
</tbody></table>

去 [GitHub Releases](https://github.com/Mystic-Stars/Axolotl/releases/latest) 或官网 [axlmc.org](/) 下载。

> Arch 还可以用 Nix / Home-Manager 安装，详见仓库 README。
> 
> 

## 安装步骤（Windows）

1. 双击运行 `.exe` 安装程序。

2. 选择安装位置（默认装到 C 盘，可以改到别的盘）。

3. 一路下一步，完成后启动。

    

**Windows 提示“未知发布者 / 已保护你的电脑”？**

点击「更多信息」→「仍要运行」。启动器完全开源，可自行审查，属于误报。

**杀毒软件（火绒、卡巴斯基等）拦截？**

同样是误报，添加信任即可。

**提示缺少 VCRUNTIME140_1.dll？**

去微软官网装一个 [VC\+\+ 运行库](https://aka.ms/vs/17/release/vc_redist.x64.exe) 再运行。

## 启动器怎么更新？

启动器内置自动更新（Tauri 签名校验），有新版本时会在后台自动下载安装，不需要手动下载安装包。

想手动检查：

1. 打开 **设置 → 更新**。

2. 点击检查更新，有新版本会提示你重启完成更新。

    

## 更新频道

启动器有三个更新频道，在 **设置 → 更新** 里切换：

<table><tbody>
<tr>
<td>

频道

</td>
<td>

适合谁

</td>
</tr>
<tr>
<td>

正式版

</td>
<td>

大多数人，稳定优先

</td>
</tr>
<tr>
<td>

Beta 测试版

</td>
<td>

想第一时间用上新功能，能接受偶尔的 bug

</td>
</tr>
<tr>
<td>

Alpha 测试版

</td>
<td>

参与测试的开发者，最激进

</td>
</tr>
</tbody></table>

切换频道后，之后的更新会自动跟着这个频道走。
