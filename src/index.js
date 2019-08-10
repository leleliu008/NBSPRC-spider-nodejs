const arg = process.argv[2] || "output-" + Date.now() + ".json";
if (arg == "-h" || arg == "--help") {
    console.log("usage: node src/index.js [OUTPUT_FILE]");
    process.exit(1);
}

const fs       = require('fs');

//https://github.com/axios/axios
const axios    = require('axios').create({
    timeout: 30000,
    responseType: 'arraybuffer'
});

//https://github.com/cheeriojs/cheerio
const cheerio  = require('cheerio');

//https://github.com/ashtuchkin/iconv-lite
const iconv    = require('iconv-lite');

//https://github.com/Reactive-Extensions/RxJS
//https://rxjs.dev/api
const { from, of }      = require('rxjs');
const { map, flatMap }  = require( 'rxjs/operators');

axios.interceptors.request.use(request => {
    //这里仅仅是为了打印日志
    //console.log(request);
    return request;
});

axios.interceptors.response.use(response => {
    if(response.data) {
        //因为页面是GBK编码的，不得不自己做解码处理
          //console.log('response.data = ' + response.data);
        response.data = iconv.decode(response.data, "GBK");
          //console.log('response.data = ' + response.data);
        return response;
    }
    throw new Error("response.data is empty!!");
});

const baseURL = "http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2018/";

const provinceIdMap = new Map();
const cityIdMap = new Map();
var provinces;

from(axios.get(baseURL))
    .pipe(
        map(response => response.data),
        map(data => cheerio.load(data)),
        map($ => {
            //分析网页结构，拿到省份数据   
            const a = $("tr.provincetr td a");
            const provinceCount = a.length;
            if (provinceCount == 0) {
                throw new Error("province list is empty!!");
            }
            provinces = new Array(provinceCount);
            a.each((i, item) => {
                const provinceId = $(item).attr('href').substr(0, 2);
                provinceIdMap.set(provinceId, i);

                const province = {};
                province.id = provinceId;
                province.name = $(item).text();
                 
                provinces[i] = province;
            });
            return provinces;
        }),
        flatMap(provinces => of(...provinces)),
        flatMap(province => from(axios.get(baseURL + province.id + ".html"))),
        map(response => {
            const $ = cheerio.load(response.data);
            //分析网页结构，拿到城市数据
            const citytr = $("tr.citytr");
            const cities = new Array(citytr.length);
            citytr.each((i, item) => {
                const td = $(item).children();

                const cityId = td.first().children().first().text().substr(0, 4);
                cityIdMap.set(cityId, i);

                const city = {};
                city.id = cityId;
                city.name = td.last().children().last().text();
                 
                cities[i] = city;
            });

            const url = response.config.url;
            const provinceId = url.substring(url.lastIndexOf('/'), url.length).substr(1, 2);
            provinces[provinceIdMap.get(provinceId)].children = cities;
            return cities;
        }),
        flatMap(cities => of(...cities)),
        flatMap(city => from(axios.get(baseURL + city.id.substr(0, 2) + "/" + city.id + ".html"))),
        map(response => {
            const $ = cheerio.load(response.data);    
            //分析网页结构，拿到区/县数据 
            const districtTr = $("tr.countytr");
            const districts = new Array(districtTr.length);
            districtTr.each((i, item) => {
                const td = $(item).children();    
                const district = {};
                    
                const td1 = td.first();
                const td1Children = td1.children();
                if (td1Children.length == 0) {
                    district.id = td1.text().substr(0, 6);
                } else {
                    district.id = td1Children.first().text().substr(0, 6);
                }

                const td2 = td.last();
                const td2Children = td2.children();
                if (td2Children.length == 0) {
                    district.name = td2.text();
                } else {
                    district.name = td2Children.last().text();
                }
                districts[i] = district;
            });

            const url = response.config.url;
            const cityId = url.substring(url.lastIndexOf('/'), url.length).substr(1, 4);
            const provinceId = cityId.substr(0, 2);
            console.log("provinceId = " + provinceId);
            console.log("cityId = " + cityId);
            provinces[provinceIdMap.get(provinceId)].children[cityIdMap.get(cityId)].children = districts;

            return districts;
        })
    )
    .subscribe(districts => {
        console.log(districts);
        console.log("------------------------------------");
    }, err => {
        console.log(err);
        process.exit(1);
    }, () => {
        const error = fs.writeFileSync(arg, JSON.stringify(provinces));        
        if (error) {
            console.log(error);    
        } else {
            console.log('success');
        }
    });
