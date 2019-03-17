# NBSPRC-spider-nodejs
扒取<a href="http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/" target=_blank>国家统计局区划代码和城乡划分代码</a>

## 在自己电脑上运行
1、安装<a href="https://blog.fpliu.com/it/software/nodejs-interpreter" target=_blank></a>和<a href="https://blog.fpliu.com/it/software/npm" target="_blank">npm</a>包管理工具。
<br>
2、启动
```
npm start
```
3、完成后，在当前目录下生成output.json.

## 在Docker中运行
如果没有Node.js环境，也不想搭建，恰巧您有Docker，可以使用Docker进行运行。
<br>
1、创建一个文件<code>~/docker_volume/xx/xx.json</code>.
<br>
2、使用docker-compose构建：
```
docker-compose build
```
3、使用docker-compose启动：
```
docker-compose up
```
4、完成后，<code>~/docker_volume/xx/xx.json</code>就是您要的最终文件。
