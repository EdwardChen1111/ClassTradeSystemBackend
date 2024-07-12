const { type } = require("os");

function addfiles (TClass) {
    const fs = require("fs");

    for (let i of TClass) {
        fs.writeFile(`./data/${i}.json`,
            JSON.stringify({
                COD:[/*{
                    num: 0,
                    dish: {
                        a餐: 0,
                        b餐: 0,
                        c餐: 0,
                        d餐: 0,
                    },
                    price: 1000,
                    time: 0,
                    status: 0,
                    show: true,// true(doing) or false(finish)
                    order: -1
                }*/],
                MDD:[
                    /*{
                        type: 'a餐',
                        data: [
                            {
                                count: 2,
                                endtime: 0,
                                mtime: 0,
                                status: 'init',
                                order: 0
                            },
                            {
                                count: 1,
                                endtime: 0,
                                mtime: 0,
                                status: 'init',
                                order: 1
                            }
                        ]
                    }*/
                ],
                SD:{
                    income: 0,
                    cost: 0,
                    best: 'a餐',
                    worst: 'b餐',
                    data: []
                },
                MSD:[
                    {
                        type: 'a餐',
                        oprice: 0,
                        nprice: 1000,
                        ocount: 50000,
                        ncount: 50000,
                        mtime: 300000,
                        ulimit: 2,
                        index: 'delete'
                    },
                    {
                        type: 'b餐',
                        oprice: 0,
                        nprice: 2000,
                        ocount: 50000,
                        ncount: 50000,
                        mtime: 150000,
                        ulimit: 2,
                        index: 'delete'
                    },
                    {
                        type: 'c餐',
                        oprice: 0,
                        nprice: 3000,
                        ocount: 50000,
                        ncount: 50000,
                        mtime: 200000,
                        ulimit: 2,
                        index: 'delete'
                    },
                    {
                        type: 'd餐',
                        oprice: 0,
                        nprice: 4000,
                        ocount: 50000,
                        ncount: 50000,
                        mtime: 250000,
                        ulimit: 2,
                        index: 'delete'
                    }
                ],
                FSD:[
                    {
                        type: 'a餐',
                        data: [
                            {
                                time: 0,
                                count: 200,
                                price: 1000,
                                order: 0
                            },
                            {
                                time: 0,
                                count: 100,
                                price: 1000,
                                order: 1
                            }
                        ]
                    },
                    {
                        type: 'b餐',
                        data: [
                            {
                                time: 0,
                                count: 200,
                                price: 1000,
                                order: 0
                            },
                            {
                                time: 0,
                                count: 300,
                                price: 1000,
                                order: 1
                            }
                        ]
                    },
                    {
                        type: 'c餐',
                        data: [
                            {
                                time: 0,
                                count: 200,
                                price: 1000,
                                order: 0
                            },
                            {
                                time: 0,
                                count: 400,
                                price: 1000,
                                order: 1
                            }
                        ]
                    },
                    {
                        type: 'd餐',
                        data: [
                            {
                                time: 0,
                                count: 200,
                                price: 1000,
                                order: 0
                            },
                            {
                                time: 0,
                                count: 500,
                                price: 1000,
                                order: 1
                            },
                        ]
                    }
                ]
            }),
            function (err) {
                if (err) return console.log(err);
            }
        );
    }
}
module.exports = addfiles;