# NBSPRC-spider-nodejs
扒取数据：[国家统计局区划代码和城乡划分代码](http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/)

## 在本地运行
1、安装依赖工具：[Node.js Runtime](http://blog.fpliu.com/it/software/Node.js)、[yarn](http://blog.fpliu.com/it/software/yarn)、[git](http://blog.fpliu.com/it/software/git)

2、下载代码、安装依赖模块、启动服务：
```
git clone https://github.com/leleliu008/NBSPRC-spider-nodejs.git
cd NBSPRC-spider-nodejs
yarn install
yarn start
```
3、完成后，在当前目录下生成`output-${timestamp}.json`

## 在Docker中运行
1、安装依赖工具：[Node.js Runtime](http://blog.fpliu.com/it/software/Node.js)、[yarn](http://blog.fpliu.com/it/software/yarn)、[git](http://blog.fpliu.com/it/software/git)、[Docker](http://blog.fpliu.com/it/software/Docker)

2、下载代码、安装依赖模块：
```
git clone https://github.com/leleliu008/NBSPRC-spider-nodejs.git
cd NBSPRC-spider-nodejs
yarn install
```
3、使用`docker-compose`构建：
```
docker-compose build
```
4、使用`docker-compose`启动：
```
docker-compose up
```
5、完成后，您本机的`~/docker_volume/NBSPRC`目录中的`.json`文件就是您要的最终文件。

## 汉字转Unicode码表示方法
为了不出现乱码，通常会将汉字使用`Unicode`码表示，这个转换需要借助<a href="http://blog.fpliu.com/it/software/development/language/Java/JDK">JDK</a>中的`native2ascii`工具，使用方法如下：
```
native2ascii xx.json new.json
```
