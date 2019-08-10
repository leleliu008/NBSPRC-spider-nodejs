# NBSPRC-spider-nodejs
扒取<a href="http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/" target=_blank>国家统计局区划代码和城乡划分代码</a>

## 在自己电脑上运行
1、安装<a href="https://blog.fpliu.com/it/software/nodejs-interpreter" target=_blank>Node.js解释器</a>和<a href="https://blog.fpliu.com/it/software/npm" target="_blank">npm</a>包管理工具。
<br>
2、下载代码、安装依赖模块、启动服务：
```
git clone https://github.com/leleliu008/NBSPRC-spider-nodejs.git
cd NBSPRC-spider-nodejs
npm install --registry=https://registry.npm.taobao.org
npm start
```
3、完成后，在当前目录下生成<code>output.json</code>。

## 在Docker中运行
如果没有现成的<a href="https://blog.fpliu.com/it/software/nodejs-interpreter" target=_blank>Node.js</a>运行时环境，也不想搭建，恰巧您有<a href="https://blog.fpliu.com/it/software/docker" target=_blank>Docker</a>，
您可以直接使用<a href="https://blog.fpliu.com/it/software/docker" target=_blank>Docker</a>进行运行，步骤如下：
<br>
1、下载代码、安装依赖模块：
```
git clone https://github.com/leleliu008/NBSPRC-spider-nodejs.git
cd NBSPRC-spider-nodejs
npm install --registry=https://registry.npm.taobao.org
```
2、使用docker-compose构建：
```
docker-compose build
```
3、使用docker-compose启动：
```
docker-compose up
```
4、完成后，您本机的<code>~/docker_volume/NBSPRC</code>目录中的<code>json</code>文件就是您要的最终文件。

## 汉字转Unicode码表示方法
为了不出现乱码，通常会将汉字使用Unicode码表示，这个转换需要借助<a href="https://blog.fpliu.com/it/software/OracleJDK" target=_blank>OracleJDK</a>中的<code>native2ascii</code>工具，使用方法如下：
```
native2ascii xx.json new.json
```
