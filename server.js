const https = require("https");
const express = require('express');
const cors = require('cors');
const fs = require("fs");
const lodash = require('lodash');

const app = express();
const port = 5000;

const corsOptions = {
    origin: [
        'https://edwardchen1111.github.io',
        'https://edwardchen1111.github.io/ClassTradeSystemVue/',
        'http://localhost:8080',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
};

let TClass = [201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220];
let Account;
let token = [];
let allData = {};
let userData = {};

/*const addfile = require("./addfile.js");
addfile(TClass);
let aaaa = {};
for (i of TClass) {
    aaaa[i] = {
        cash: {
            password: 'cash',
            maxonline: 4,
        },
        mdish: {
            password: 'mdish',
            maxonline: 4,
        },
        odish: {
            password: 'odish',
            maxonline: 4,
        },
        back: {
            password: 'back',
            maxonline: 4,
        },
    };
}
fs.writeFile(`./data/userinfo.json`, JSON.stringify(aaaa), function (err) {
    if (err) return console.log(err);
});*/
///初始化資料結構

fs.readFile(`./data/userinfo.json`, function (err, data) {
    if (err) return console.log(err);
    
    let temp = JSON.parse(data);
    Account = temp;
    for (let i in Account) {
        userData[i] = [];
        for (let j in Account[i]) {
            userData[i].push({
                account: j,
                password: Account[i][j].password,
                onlinecount: 0,
                maxonline: Account[i][j].maxonline,
                data: []
            });
        }
    }
});

for (let i of TClass) {
    fs.readFile(`./data/${i}.json`, function (err, data) {
        if (err) return console.log(err);
        
        let temp = JSON.parse(data);
        allData[i] = temp;
        allData[i].updateTime = Date.now();
    });
}

let start = 0,end = 0;
const autoUpdate = setInterval(() => {
    start = Date.now();

    let temp = [];
    for (let i in token) {
        if (Date.now() - token[i].checkTime <= 10000) {
            temp[i] = token[i];
        } else {
            for (let j in userData[token[i].class]) {
                if (userData[token[i].class][j].account == token[i].account) {
                    userData[token[i].class][j].onlinecount -= 1;
                    userData[token[i].class][j].data.splice(userData[token[i].class][j].data.indexOf(i),1);
                }
            }
            allData[token[i].class].updateTime = Date.now();
        }
    }
    token = temp;

    for (let i of TClass) {
        let checklist = [], order = [], CODtime = [], isUpdate = false, starting = false;
        for (let j in allData[i].MDD) {
            if (allData[i].MDD[j].data.length != 0 && allData[i].MDD[j].data[0].status == 'start') {
                starting = true;
                for (let k in allData[i].MDD[j].data) {
                    if (allData[i].MDD[j].data[k].status == 'start' && allData[i].MDD[j].data[k].mtime > 0) {
                        allData[i].MDD[j].data[k].mtime -= 1000;
                        allData[i].MDD[j].data[k].endtime = allData[i].MDD[j].data[k].mtime;
                        isUpdate = true;
                    } else if (allData[i].MDD[j].data[k].endtime > allData[i].MDD[j].data[k].mtime && isUpdate) {
                        allData[i].MDD[j].data[k].endtime -= 1000;
                    }
                    
                    if (order[allData[i].MDD[j].data[k].order] == undefined) {
                        order[allData[i].MDD[j].data[k].order] = allData[i].MDD[j].data[k].endtime;
                    } else {
                        order[allData[i].MDD[j].data[k].order] = Math.max(order[allData[i].MDD[j].data[k].order], allData[i].MDD[j].data[k].endtime);
                    }
                }
            } else if (allData[i].MDD[j].data.length != 0 && allData[i].MDD[j].data[0].status == 'init') {
                checklist.push(j);
            }
        }

        if (!starting) {
            checklist = [];
        }

        for (let j of allData[i].COD) {
            CODtime[j.order] = j.time;
        }

        for (let j of checklist) {
            if (allData[i].MDD[j].data[0].endtime > allData[i].MDD[j].data[0].mtime && CODtime[allData[i].MDD[j].data[0].order] > order[allData[i].MDD[j].data[0].order]) {
                isUpdate = true;
                for (let k in allData[i].MDD[j].data) {
                    allData[i].MDD[j].data[k].endtime -= 1000;
                    
                    if (order[allData[i].MDD[j].data[k].order] == undefined) {
                        order[allData[i].MDD[j].data[k].order] = allData[i].MDD[j].data[k].endtime;
                    } else {
                        order[allData[i].MDD[j].data[k].order] = Math.max(order[allData[i].MDD[j].data[k].order], allData[i].MDD[j].data[k].endtime);
                    }
                }
            }
        }

        for (let j in allData[i].COD) {
            if (allData[i].COD[j].time > order[allData[i].COD[j].order]) {
                allData[i].COD[j].time = order[allData[i].COD[j].order];
            }
        }

        for (let j in allData[i].FSD) {
            if (allData[i].FSD[j].data.length != 0 && allData[i].FSD[j].data[0].time < Date.now()) {
                for (let k in allData[i].MSD) {
                    if (allData[i].MSD[k].type == allData[i].FSD[j].type && allData[i].MSD[k].ncount >= allData[i].FSD[j].data[0].count) {
                        allData[i].MSD[k].nprice = allData[i].FSD[j].data[0].price;
                    }
                }
                allData[i].FSD[j].data.splice(0, 1);
                isUpdate = true;
            }
        }

        if (isUpdate) {
            allData[i].updateTime = Date.now();
        }
    }

    end = Date.now();
},(1000 + start - end));

function storeData (UClass) {
    const WData = JSON.stringify({
        COD: allData[UClass].COD,
        MDD: allData[UClass].MDD,
        SD: allData[UClass].SD,
        MSD: allData[UClass].MSD,
        FSD: allData[UClass].FSD,
    })
    fs.writeFile(`./data/${UClass}.json`, WData, function (err) {
            if (err) return console.log(err);
        }
    )
    fs.writeFile(`./data/userinfo.json`, JSON.stringify(Account), function (err) {
        if (err) return console.log(err);
    }
)
    console.log(`${Date.now()}store${UClass}.json`)
}

app.use(cors(corsOptions));
app.use(express.json());

app.post('/login', (req, res) => {
    if (req.header('Authorization') == 'first') {
        const userinfo = req.body;
        if (!userinfo['class'] || TClass.indexOf(parseInt(userinfo['class'])) == -1) return res.status(500).send('non insist class');
        if (!userinfo['account'] || Account[parseInt(userinfo['class'])][userinfo['account']] == null) return res.status(500).send('non insist account');
        if (!userinfo['passw'] || Account[parseInt(userinfo['class'])][userinfo['account']].password != userinfo['passw']) return res.status(500).send('passw error');

        let tempToken = Math.random();
        while (token[tempToken] != undefined) {
            tempToken = Math.random();
        }

        token[tempToken] = {
            class: userinfo['class'],
            account: userinfo['account'],
            updateTime: Date.now(),
            checkTime: Date.now()
        };

        for (let i in userData[parseInt(userinfo['class'])]) {
            if (userData[parseInt(userinfo['class'])][i].account == userinfo['account'] && userData[parseInt(userinfo['class'])][i].onlinecount < userData[parseInt(userinfo['class'])][i].maxonline) {
                userData[parseInt(userinfo['class'])][i].onlinecount += 1;
                userData[parseInt(userinfo['class'])][i].data.push(tempToken);
                allData[userinfo['class']].updateTime = Date.now();
            } else if (userData[parseInt(userinfo['class'])][i].onlinecount >= userData[parseInt(userinfo['class'])][i].maxonline) {
                return res.status(500).send('people full');
            }
        }

        res.status(200).send({token: tempToken});
    } else {
        res.status(500).send('you blew up');
    }
})

app.get('/init', (req, res) => {
    let TToken = token[req.header('Authorization')];
    if (TToken) {
        token[req.header('Authorization')].updateTime = Date.now();
        let UClass = TToken.class, temp = allData[UClass];
        temp['UserData'] = userData[UClass];
        res.status(200).send(temp);
    } else {
        res.status(500).send('log out');
    }
})

app.get('/checkUpdate', (req, res) => {
    let TToken = token[req.header('Authorization')];
    if (TToken) {
        let UClass = TToken.class;
        token[req.header('Authorization')].checkTime = Date.now();
        if (allData[UClass].updateTime < TToken.updateTime) {
            res.status(200).send('noUpdate');
        } else {
            token[req.header('Authorization')].updateTime = Date.now();
            let temp = allData[UClass];
            temp['UserData'] = userData[UClass];
            res.status(200).send(temp);
        }
    } else {
        res.status(500).send('log out');
    }
})

app.post('/modifyOrder', (req, res) => {
    if (token[req.header('Authorization')]) {
        let UClass = token[req.header('Authorization')].class;
        if (token[req.header('Authorization')].account != 'mdish') {
            const thing = req.body;
            allData[UClass].updateTime = Date.now();
            
            if (thing.doing == 'add') {
                allData[UClass].COD.push(thing.dict);
                for (let i in thing.dict.dish) {
                    if (thing.dict.dish[i] != 0) {
                        let j, data, time = thing.dict.time, num = thing.dict.dish[i], temp = [];
                        for (j in allData[UClass].MDD) {
                            if (allData[UClass].MDD[j].type == i) {
                                break;
                            }
                        }
                        if (j == undefined || allData[UClass].MDD[j].type != i) {
                            allData[UClass].MDD.push({
                                type: i,
                                data: []
                            });
                            j = allData[UClass].MDD.length - 1;
                        }
                        for (let k in allData[UClass].MSD) {
                            if (allData[UClass].MSD[k].type == i) {
                                allData[UClass].MSD[k].ncount -= thing.dict.dish[i];
                                allData[UClass].SD.income += thing.dict.dish[i]*allData[UClass].MSD[k].nprice;
                                data = allData[UClass].MSD[k];
                                break
                            }
                        }
                        
                        while (num > 0) {
                            let count = 0;
                            if (num <= data.ulimit) {
                                count = num;
                                num = 0;
                            } else {
                                count = data.ulimit;
                                num -= data.ulimit;
                            }
                            temp.push({
                                count: count,
                                endtime: time,
                                mtime: data.mtime,
                                status: 'init',
                                order: thing.dict.order
                            });
                            time -= data.mtime;
                        }

                        temp.reverse();
                        allData[UClass].MDD[j].data.push(...temp);
                    }
                }
            } else if (thing.doing == 'remove') {
                for (let i in allData[UClass].COD) {
                    if (allData[UClass].COD[i].order == thing.dict.order && !allData[UClass].COD[i].status) {
                        for (let j in allData[UClass].COD[i].dish) {
                            if (allData[UClass].COD[i].dish[j] != 0) {
                                for (let k in allData[UClass].MSD) {
                                    if (allData[UClass].MSD[k].type == j) {
                                        allData[UClass].MSD[k].ncount += allData[UClass].COD[i].dish[j];
                                        allData[UClass].SD.income -= allData[UClass].COD[i].dish[j]*allData[UClass].MSD[k].nprice;
                                        break
                                    }
                                }
                            }
                        }
                        
                        allData[UClass].COD.splice(i,1);
                        let NMDD = [];
                        allData[UClass].MDD.forEach((item) => {
                            if (item.data != undefined && item.data != []) {
                                let temp = {
                                    type: item.type,
                                    data: []
                                };
                                item.data.forEach((inside) => {
                                    if (inside.order != thing.dict.order) {
                                        temp.data.push(inside);
                                    }
                                });
                                NMDD.push(temp);
                            }
                        });
                        allData[UClass].MDD = NMDD;
                    } else if (allData[UClass].COD[i].order == thing.dict.order && allData[UClass].COD[i].status) {
                        res.status(500).send('無法取消');
                    }
                }
            } else if (thing.doing == 'finish') {
                for (let i in allData[UClass].COD) {
                    if (allData[UClass].COD[i].order == thing.dict.order) {
                        allData[UClass].COD[i].status = 2;
                        allData[UClass].COD[i].show = false;
                    }
                }
            }
            storeData(UClass);
        }
        res.status(200).send('success');
    } else {
        res.status(500).send('log out');
    }
})

app.post('/modifyMdish', (req, res) => {
    if (token[req.header('Authorization')]) {
        let UClass = token[req.header('Authorization')].class;
        if (token[req.header('Authorization')].account == 'mdish' || token[req.header('Authorization')].account == 'back') {
            allData[UClass].updateTime = Date.now();
            const thing = req.body;
            let i;
            for (i in allData[UClass].MDD) {
                if (allData[UClass].MDD[i].type == thing.type) {
                    break
                }
            }
            for (let j in allData[UClass].COD) {
                if (allData[UClass].COD[j].order == thing.dict.order) {
                    allData[UClass].COD[j].status = 1;
                    break
                }
            }

            if (thing.doing == 'start' || (thing.doing == 'stop' && allData[UClass].MDD[i].data[0].status == 'stop')) {
                allData[UClass].MDD[i].data[0].status = 'start';
            } else if (thing.doing == 'stop' && allData[UClass].MDD[i].data[0].status == 'start') {
                allData[UClass].MDD[i].data[0].status = 'stop';
            } else if (thing.doing == 'complete') {
                allData[UClass].MDD[i].data.splice(0, 1);
            }
            storeData(UClass);
            res.status(200).send('success');
        } else {
            res.status(500).send('account deny');
        }
    } else {
        res.status(500).send('log out');
    }
})

app.post('/mealSettingData', (req, res) => {
    if (token[req.header('Authorization')]) {
        let UClass = token[req.header('Authorization')].class;
        if (token[req.header('Authorization')].account == 'mdish' || token[req.header('Authorization')].account == 'back') {
            allData[UClass].updateTime = Date.now();
            const thing = req.body;
            
            if (thing.doing == 'addDish') {
                let check = false, i;
                for (i in allData[UClass].MSD) {
                    if (allData[UClass].MSD[i].type == thing.dict.type) {
                        check = true;
                        break
                    }
                }
                if (check) {
                    allData[UClass].SD.cost -= allData[UClass].MSD[i].oprice*allData[UClass].MSD[i].ocount;
                    allData[UClass].MSD.splice(i, 1, thing.dict);
                    allData[UClass].SD.cost += thing.dict.oprice*thing.dict.ocount;
                } else {
                    allData[UClass].MSD.push(thing.dict);
                    allData[UClass].FSD.push({
                        type: thing.dict.type,
                        data: []
                    });
                    allData[UClass].SD.cost += thing.dict.oprice*thing.dict.ocount;
                }
            } else if (thing.doing == 'addCombo') {
                let check = false, i;
                for (i in allData[UClass].MSD) {
                    if (allData[UClass].MSD[i].type == thing.dict.type) {
                        check = true;
                        break
                    }
                }
                if (check) {
                    allData[UClass].MSD.splice(i, 1, thing.dict);
                } else {
                    allData[UClass].MSD.push(thing.dict);
                }
            } else if (thing.doing == 'remove') {
                let i, j, find = false, selling = false;
                for (i in allData[UClass].MSD) {
                    if (allData[UClass].MSD[i].type == thing.dict.type) {
                        find = true;
                        break;
                    }
                }
                if (thing.dict.index == 'delete') {
                    for (j in allData[UClass].MDD) {
                        if (allData[UClass].MDD[j].type == thing.dict.type && allData[UClass].MDD[j].data.length != 0) {
                            selling = true;
                            break;
                        }
                    }
                }/* else {
                    for (j in )
                }*/
                if (find && !selling) {
                    allData[UClass].MSD.splice(i,1);
                    allData[UClass].MDD.splice(i,1);
                    if (thing.dict.index == 'delete') {
                        allData[UClass].SD.cost -= thing.dict.oprice*thing.dict.ocount;
                        for (let j in allData[UClass].FSD) {
                            if (allData[UClass].FSD[j].type == thing.dict.type) {
                                allData[UClass].FSD.splice(j,1);
                            }
                        }
                    }

                    res.status(200).send('success');
                } else if (!find) {
                    res.status(500).send('not find');
                } else if (selling) {
                    res.status(500).send('is selling');
                }
            } 
            storeData(UClass);
        } else {
            res.status(500).send('account deny');
        }
    } else {
        res.status(500).send('log out');
    }
})

app.post('/modifyFormula', (req, res) => {
    if (token[req.header('Authorization')]) {
        let UClass = token[req.header('Authorization')].class;
        if (token[req.header('Authorization')].account == 'back') {
            allData[UClass].updateTime = Date.now();
            const thing = req.body;

            if (thing.doing == 'addFormula') {
                for (let i in allData[UClass].FSD) {
                    if (allData[UClass].FSD[i].type == thing.type) {
                        let check = false;
                        if (allData[UClass].FSD[i].data.length != 0) {
                            for (let j in allData[UClass].FSD[i].data) {
                                if (allData[UClass].FSD[i].data[j].order == thing.dict.order) {
                                    check = true;
                                    allData[UClass].FSD[i].data.splice(j, 1, thing.dict);
                                    break;
                                }
                            }
                        }
                        
                        if (!check) {
                            allData[UClass].FSD[i].data.push(thing.dict);
                        }
                        allData[UClass].FSD[i].data.sort((a,b) => {
                            return a.time - b.time;
                        });
                        break;
                    }
                }
            } else if (thing.doing == 'remove') {
                for (let i in allData[UClass].FSD) {
                    if (allData[UClass].FSD[i].type == thing.type && allData[UClass].FSD[i].data.length != 0) {
                        for (let j in allData[UClass].FSD[i].data) {
                            if (allData[UClass].FSD[i].data[j].order == thing.dict.order) {
                                allData[UClass].FSD[i].data.splice(j, 1);
                                break;
                            }
                        }
                        break;
                    }
                }
            }

            storeData(UClass);
            res.status(200).send('success');
        } else {
            res.status(500).send('account deny');
        }
    } else {
        res.status(500).send('log out');
    }
})

app.post('/modifyComboCount', (req, res) => {
    if (token[req.header('Authorization')]) {
        let UClass = token[req.header('Authorization')].class;
        if (token[req.header('Authorization')].account == 'mdish' || token[req.header('Authorization')].account == 'back') {
            allData[UClass].updateTime = Date.now();
            const thing = req.body;
            
            for (let i in allData[UClass].MSD) {
                if (allData[UClass].MSD[i].type == thing.type) {
                    allData[UClass].MSD[i].ncount -= thing.count;
                }
            }

            storeData(UClass);
            res.status(200).send('success');
        } else {
            res.status(500).send('account deny');
        }
    } else {
        res.status(500).send('log out');
    }
})

app.post('/modifyUserData', (req, res) => {
    if (token[req.header('Authorization')]) {
        let UClass = token[req.header('Authorization')].class;
        if (token[req.header('Authorization')].account == 'back') {
            const thing = req.body;
            Account[UClass][thing.dict.account] = {
                password: thing.dict.password,
                maxonline: thing.dict.maxonline
            };
            for (let i in userData[UClass]) {
                if (userData[UClass][i].account == thing.dict.account) {
                    if (userData[UClass][i].password != thing.dict.password) {
                        userData[UClass][i] = lodash.cloneDeep(thing.dict);
                        Account[UClass][thing.dict.account].password = thing.dict.password;
                        for (let j of thing.dict.data) {
                            delete token[j];
                        }
                        userData[UClass][i].data = [];
                    } else {
                        userData[UClass][i] = thing.dict;
                    }
                    Account[UClass][thing.dict.account].maxonline = thing.dict.maxonline;
                    break;
                }
            }
            storeData(UClass);
            allData[UClass].updateTime = Date.now();
            res.status(200).send('success');
        } else {
            res.status(500).send('account deny');
        }
    } else {
        res.status(500).send('log out');
    }
})

app.post('/modifyUserLogOut', (req, res) => {
    if (token[req.header('Authorization')]) {
        let UClass = token[req.header('Authorization')].class;
        if (token[req.header('Authorization')].account == 'back') {
            const thing = req.body;
            for (let i in userData[UClass]) {
                if (userData[UClass][i].account == thing.account) {
                    userData[UClass][i].onlinecount -= 1;
                    userData[UClass][i].data.splice(userData[UClass][i].data.indexOf(thing.token),1);
                    allData[UClass].updateTime = Date.now();
                    delete token[thing.token];
                }
            }
        }
    } else {
        res.status(500).send('log out');
    }
})

app.use(express.static(__dirname + '/static', { dotfiles: 'allow' }))

https
  .createServer(
    {
      key: fs.readFileSync('./static/privkey.pem'),
      cert: fs.readFileSync('./static/cert.pem'),
      ca: fs.readFileSync('./static/chain.pem'),
    },
    app
  )
  .listen(port, () => {
    console.log('Listening...')
  })

/*app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})*/