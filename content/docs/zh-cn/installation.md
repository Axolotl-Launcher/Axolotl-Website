---
title: "安装与更新"
description: "保姆级安装教程，照着点就行。"
locale: "zh-CN"
slug: "installation"
group: "开始使用"
order: 2
updatedAt: "2026-10-07T09:38:51.000Z"
---

> 保姆级安装教程，照着点就行。
> 
> 

## 第一步：下载启动器

打开浏览器，访问 **GitHub Releases 页面**：

[https://github.com/Mystic-Stars/Axolotl/releases/latest](https://github.com/Mystic-Stars/Axolotl/releases/latest)

这个页面会自动跳转到最新版本。往下滚，找到 **Assets**（资源）区域，里面有一堆文件，**认准下面这几个**：

<table><tbody>
<tr>
<td>

你的系统

</td>
<td>

下载哪个文件

</td>
<td>

说明

</td>
</tr>
<tr>
<td>

**Windows**（10 或 11）

</td>
<td>

`Axolotl.Launcher_<版本>_x64-setup.exe`

</td>
<td>

比如 `Axolotl.Launcher_1.7.4_x64-setup.exe`，是安装程序

</td>
</tr>
<tr>
<td>

**Windows 便携版**

</td>
<td>

`Axolotl.Launcher_<版本>_x64_portable.zip`

</td>
<td>

免安装，解压就能用，喜欢绿色软件选这个

</td>
</tr>
<tr>
<td>

**macOS**（苹果电脑）

</td>
<td>

`Axolotl.Launcher_<版本>_universal.dmg`

</td>
<td>

通用版本，Intel 和苹果芯片都能用

</td>
</tr>
<tr>
<td>

**Linux**

</td>
<td>

`Axolotl.Launcher_<版本>_amd64.AppImage` / `.deb` / `.rpm`

</td>
<td>

推荐 `.AppImage`，双击就能跑

</td>
</tr>
</tbody></table>

> 版本号会持续更新，认准文件名格式就行，别管具体数字。
> 
> 

> 不知道怎么分辨 Windows / macOS / Linux？Windows 就是最常见的电脑（戴尔、联想、华硕那种）；macOS 是苹果的 MacBook / iMac；Linux 一般只有程序员在用，如果你不确定，那你大概率是 Windows。
> 
> 

## 第二步：安装

### Windows

1. 双击下载好的 `.exe` 文件

2. 如果弹出“Windows 已保护你的电脑”之类的蓝色提示，点 **更多信息 → 仍要运行**（这是正常的，开源软件第一次运行经常被系统提醒）

3. 一路点“下一步”直到安装完成

4. 桌面上会出现 Axolotl 图标，双击打开

### macOS

1. 双击下载好的 `.dmg` 文件

2. 会弹出一个窗口，把 Axolotl 的图标拖进“应用程序”文件夹

3. 从启动台打开 Axolotl（第一次打开如果提示“无法验证开发者”，去 系统设置 → 隐私与安全性 里点“仍要打开”）

### Linux

推荐 `.AppImage`：

```bash
chmod +x Axolotl*.AppImage
./Axolotl*.AppImage
```

或者用包管理器安装（省事）：

```bash
# Arch Linux (AUR)
yay -S axolotl-launcher

# Debian / Ubuntu (APT)
curl -fsSL https://ppa.axlmc.org/setup.sh | sudo bash
sudo apt install axolotl-launcher
```

## 第三步：确认安装成功

打开 Axolotl，如果看到主界面（有“浏览”“游戏库”这些字眼），说明安装成功啦！接下来去[快速上手](/docs/sign-in)继续。

## 以后怎么更新？

**完全不用管。** Axolotl 会在后台自动检测新版本，下载好、校验签名后自动更新。你只需要偶尔看到提示点个“重启更新”就行。

更新不会动你的任何数据：实例、模组、存档、设置全都保留。

---

*接下来：登录你的账户 → *[*快速上手*](/docs/sign-in)
