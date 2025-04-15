# jumpserver拉起本地navivat油猴脚本

## 免责声明

**本脚本为免费使用，本脚本只供个人学习使用，使用需严格遵守开源许可协议。严禁用于商业用途，禁止进行任何盈利活动。对一切非法使用所产生的后果，概不负责！**

## 脚本声明

- **本脚本适用于mac系统，不适用于windows**
- **如果遇到bug问题，请反馈issue给我**

## 使用说明

- 本脚本为油猴脚本，需要下载谷歌浏览器应用：篡改猴
- 公司内部署的jumpserver需要支持web终端-连接-客户端-DB连接向导
- 对照main.js内的注释(自定义字样)，修改为公司内部署的连接地址/端口号等
- 修改脚本的@match,即监听的网址
- 完成修改脚本后，粘贴进篡改猴（新增脚本）
- 进行测试,拉起navicat后，选择新建连接，然后将密码粘贴进密码框即可(navicat不支持密码自动填充，所以会将密码默认复制到剪切板，直接粘贴即可)
- 使用完成后，记的删除本地的连接信息
- 目前支持mysql/pgsql/sqlserver
- win版本静待后续支持



## 许可证

![](image/LGPL.svg)
