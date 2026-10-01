# DeepDreamer

面向潜在客户的 AI 产品展示网站。首页提供产品导航与简短介绍，详情页展示产品场景、固定脚本演示与当前阶段。

## 页面

- `index.html`：产品首页、探索入口与合作需求提示。
- `lecturer.html`：小讲师与数学试讲演示。
- `finance.html`：个人记账与预览确认演示。
- `teams.html`：智能体协作与五阶段横向画廊。
- `explorations.html`：知识、提示词、AI 情报与业务研究方向。

## 本地预览与检查

无需安装依赖或构建：

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8000/`。检查命令：

```sh
python3 tests/check.py
node --check assets/site.js
node --check assets/field.js
node --check assets/demos.js
```

浏览器打开 `http://127.0.0.1:8000/tests/check.html`，等待检查结果。它实际运行五页、三种视口的演示与布局检查。手机预览示例：`tests/check.html?preview=lecturer&width=375&height=812`。

## 发布

所有页面与资源使用相对路径，可以部署在网站根路径或 GitHub Pages 项目路径。GitHub Actions 在 PR 上检查静态链接与脚本语法；合入 `main` 后可发布到 GitHub Pages。仓库 Pages 的发布来源需要设置为 GitHub Actions。

发布制品只包含五个 HTML 页面和 `assets/`，不包含测试、文档和运行证据。业务产品继续在各自仓库维护，网站不连接业务服务、不保存演示内容，也不读取真实用户数据。

## 内容边界

- 演示是固定脚本，不调用模型；不代表真实项目运行状态或产品效果测量。
- 原型与探索项目标明当前阶段，不将研究方向包装成已经交付的能力。
- 合作区当前提供需求提示，尚未接入公开联系方式或提交接口。
- 粒子动画可暂停，尊重减少动态偏好；主题偏好保存在当前浏览器。
