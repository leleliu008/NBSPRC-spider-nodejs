const arg = process.argv[2] || "output-" + Date.now() + ".json";
if (arg == "-h" || arg == "--help") {
    console.log("usage: node src/index.js [OUTPUT_FILE]");
    process.exit(1);
}

const fs       = require('fs');

//https://github.com/cheeriojs/cheerio
const cheerio  = require('cheerio');

//https://github.com/ashtuchkin/iconv-lite
const iconv    = require('iconv-lite');

//https://github.com/Reactive-Extensions/RxJS
//https://rxjs.dev/api
const { from, of, interval } = require('rxjs');
const { map, concatMap, retry, take, tap }  = require('rxjs/operators');

//https://github.com/axios/axios
const axios    = require('axios').default;
axios.defaults.baseURL = "http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2018/";
axios.defaults.timeout = 300000;
axios.defaults.maxRedirects = 1000;
axios.defaults.responseType = 'arraybuffer';
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36';
axios.defaults.headers.common['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8';
axios.interceptors.request.use(config => {
    let cookie = cookieArray.join(';');
    if (cookie) {
        config.headers['Cookie'] = cookie;
    }
    //console.log(config);
    return config;
});
axios.interceptors.response.use(response => {
    if(response.data) {
        //因为页面是GBK编码的，不得不自己做解码处理
        response.data = iconv.decode(response.data, "GBK");
        return response;
    }
    throw new Error("response.data is empty!!");
});

const provinceIdMap = new Map();
const cityIdMap = new Map();
var provinces;
var cookieArray = [];

const INTERVAL_MILLES = 60000;

from(axios.get('/'))
    .pipe(
        tap(response => {
            const cookies = response.headers['set-cookie'];
            if (cookies && cookies.length > 0) {
                for (cookie of cookies) {
                    const cookieValues = cookie.split(';');
                    if (cookieValues && cookieValues.length > 0) {
                        cookieArray.push(cookieValues[0]);
                    }
                }
            }
        }),
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
        concatMap(provinces => interval(INTERVAL_MILLES).pipe(take(provinces.length), map(i => provinces[i]))),
        concatMap(province => from(axios.get(province.id + ".html")).pipe(retry(5))),
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
            const provinceId = url.substr(0, 2);
            provinces[provinceIdMap.get(provinceId)].children = cities;
            return cities;
        }),
        concatMap(cities => interval(INTERVAL_MILLES).pipe(take(cities.length), map(i => cities[i]))),
        concatMap(city => from(axios.get(city.id.substr(0, 2) + "/" + city.id + ".html")).pipe(retry(5))),
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
            const cityId = url.substr(3, 4);
            const provinceId = cityId.substr(0, 2);
            console.log("url = " + url);
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
        console.error("error occurred : ", err);
        process.exit(1);
    }, () => {
        const error = fs.writeFileSync(arg, JSON.stringify(provinces));        
        if (error) {
            console.log(error);    
        } else {
            console.log('success');
        }
    });
