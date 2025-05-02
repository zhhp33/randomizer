# 今天吃什么 · 随机菜单选择器（明道云插件）

## 项目简介

本项目是一个基于 React 的明道云视图插件，提供"今天吃什么"随机菜单选择功能。用户点击按钮即可在丰富的菜单中随机选择，支持自定义候选项、历史记录展示，并可集成明道云工作表数据。

## 主要功能
- 随机菜单抽取，动画效果丰富
- 支持自定义菜单项或从明道云工作表字段读取候选
- 历史记录展示（本地会话，最多10条）
- 响应式设计，适配多终端
- 现代 UI 风格，交互友好

## 目录结构
```
randomizer/
├── dist/                # 构建产物
├── node_modules/        # 依赖包
├── src/                 # 源码目录
│   ├── App.js           # 主功能组件
│   ├── App.js.bak       # 历史版本备份
│   ├── index.js         # 入口文件
│   ├── style.less       # 全局样式
│   └── icon.svg         # 插件图标
├── .config/             # 明道云插件参数配置
│   └── params-config.json
├── package.json         # 项目依赖与脚本
├── package-lock.json    # 依赖锁定
├── mdye.json            # 明道云插件元信息
└── .gitignore           # Git忽略文件
```

## 安装与使用

1. 安装依赖：
   ```bash
   npm install
   ```
2. 本地开发：
   ```bash
   mdye start
   ```
3. 构建打包：
   ```bash
   mdye build
   ```
4. 推送到明道云插件市场：
   ```bash
   mdye push -m "发布说明"
   ```

## 明道云插件说明
- 插件基于明道云 [视图插件开发规范](https://help.mingdao.com/extensions/developer/view/) 实现。
- 支持通过 `.config/params-config.json` 配置自定义页面标题、候选字段、自定义候选内容等。
- 可集成明道云工作表数据，自动读取指定字段作为菜单候选。

## 技术栈
- React 18
- styled-components
- 明道云 mdye 插件开发工具
- LESS

## 定制与扩展
- 如需自定义菜单项、页面标题等，可在明道云插件参数配置中调整。
- 支持二次开发，代码结构清晰，便于维护和扩展。

## 致谢
- 明道云团队及开源社区
- 参考了部分网络动画与交互设计

---
如有问题或建议，欢迎反馈与交流。 