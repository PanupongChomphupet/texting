const express = require("express");
const UniqueStringGenerator = require('unique-string-generator')
const app = express();
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectID;
const mongo = require("mongodb").MongoClient;
const bcrypt = require('bcrypt');
const fileUpload = require("express-fileupload");
const jwt = require('jsonwebtoken');
const e = require("express");
const { FiRewind } = require("react-icons/fi");
const { send } = require("process");
const { Storage } = require("@google-cloud/storage");
const fs = require("fs");

const gc = new Storage({
    keyFilename: __dirname + "/fitness-course-314718-e113ffcda5d4.json",
    projectId: 'fitness-course-314718'
})
const filesBucket = gc.bucket('video-course');

app.use(cors());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, './tmp'),
}))

function date() {
    const date = new Date()

    const month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : date.getMonth();
    const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
    const dates = date.getFullYear() + "-" + month + "-" + day
    const hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
    const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
    const time = hours + ":" + minutes;
    return {
        date: dates,
        times: time
    }
}

mongo.connect("mongodb://localhost:27017", { useUnifiedTopology: true }, (err, db) => {
    if (err) throw err;
    var dbcon = db.db("userdata");

    app.post("/register", async (req, res) => {
        const { name_surname, age, weight, heigth, gender, tel } = req.body
        if ((name_surname !== '' && tel !== '' && req.body.password !== '')) {
            async function mvFileone() {
                return new Promise((resolve, reject) => {
                    const fileName = UniqueStringGenerator.UniqueStringId() + "." +
                        req.files.image_path.name.split(".").slice(-1)[0];
                    req.files.image_path.mv(__dirname + "/images/" + fileName, err => {
                        if (err) throw err;
                        resolve(fileName);
                        filesBucket.upload(__dirname + "/images/" + fileName, (err, file) => {
                            if (err) throw err;
                            fs.unlinkSync(__dirname + "/images/" + fileName);
                        })
                    })
                })
            }
            let fileName = ''
            if (req.files) {
                fileName = await mvFileone()
            }
            dbcon.collection("user").findOne({ tel: tel }, (err, result) => {
                if (err) throw err
                if (result === null) {
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) throw (err);
                        dbcon.collection("user").insert({
                            date: date().date,
                            time: date().times,
                            name: name_surname,
                            age: age,
                            weight: weight,
                            height: heigth,
                            gender: gender,
                            tel: tel,
                            password: hash,
                            img_path: fileName,
                            rights: "user",
                            Bill: [],
                            Mycouse: [],

                        },
                            (err, result) => {
                                if (err) throw err;
                                if (result) {
                                    res.json({ tel: tel, password: req.body.password })
                                } else {
                                    res.send("ไม่สำเร็จ");
                                }
                            })
                    })
                } else {
                    res.send('อีเมลนี้มีคนใช้แล้ว');
                }
            })
        } else {
            res.send('ข้อมูลไม่คบ');
        }
    })

    app.post("/login", (req, res) => {
        dbcon.collection("user").findOne({ tel: req.body.tel }, (err, result) => {
            if (err) throw err;
            if (result) {
                const { _id, name, age, weight, height, gender, tel, rights } = result
                bcrypt.compare(req.body.password, result.password, function (err, psResult) {
                    if (err) throw (err);
                    if (psResult) {
                        const token = jwt.sign({
                            _id, name, age, weight, height, gender, tel, rights,
                        }, 'dc7fea65a4w2s3w4a5w5w5f6g4r5y2f0');
                        if (err) throw err;
                        res.json({ token, right: result.rights });
                    } else {
                        res.json({ token: "" });
                    }
                })
            } else {
                res.json({ token: "" });

            }
        })
    })

    app.post('/check-login', (req, res) => {
        const { token } = req.body;
        jwt.verify(token, 'dc7fea65a4w2s3w4a5w5w5f6g4r5y2f0', function (err, decoded) {
            if (err) throw err;
            dbcon.collection("user").findOne({ _id: ObjectId(decoded._id) }, { projection: { Bill: 0, password: 0 } }, (err, result) => {
                if (err) throw err;
                const { name, age, weight, height, gender, rights } = result
                res.json({
                    status: "success",
                    name, age, weight, height, gender, rights
                })
            })
        })
    })

    app.get("/course", (req, res) => {
        dbcon.collection("course").find({}).toArray((err, result) => {
            if (err) throw err;
            res.json({ cos: result })
        })
    })

    app.get("/detail/:id", (req, res) => {
        const id = req.params.id
        dbcon.collection("course").findOne({ _id: ObjectId(id) }, (err, result) => {
            if (err) throw err;
            res.json({ cours: result, level: result.level })
        })
    })

    app.post('/bill-ckeck', (req, res) => {
        const { token, idcouse } = req.body;
        jwt.verify(token, 'dc7fea65a4w2s3w4a5w5w5f6g4r5y2f0', function (err, decoded) {
            if (err) throw err
            dbcon.collection("user").update({ _id: ObjectId(decoded._id) }, {
                $push: {
                    Bill: {
                        idcours: idcouse,
                        Id: UniqueStringGenerator.UniqueString(),
                        date: date().date,
                        time: date().times,
                        namecouse: req.body.namecouse,
                        level: req.body.level,
                        sumprice: req.body.sumprice,
                        approve: false,
                    }
                }
            }, (err, result) => {
                if (err) throw err
                if (result) {
                    res.send("สำเร็จ")
                } else {
                    res.send("ไม่สำเร็จ")
                }
            })

        })
    })

    app.post("/hdetail/:Id", (req, res) => {
        const Id = req.params.Id;
        const { token } = req.body;
        jwt.verify(token, 'dc7fea65a4w2s3w4a5w5w5f6g4r5y2f0', function (err, decoded) {
            dbcon.collection("user").findOne({ _id: ObjectId(decoded._id) }, {
                projection
                    : {
                    Bill: { $elemMatch: { Id: Id } }
                    , _id: 0
                    , name: 0
                    , age: 0
                    , weight: 0
                    , height: 0
                    , gender: 0
                    , tel: 0
                    , email: 0
                    , password: 0

                }
            },
                (err, result) => {
                    if (err) throw (err);
                    res.json({ Bill: result.Bill })
                })
        })
    })

    app.post('/history', (req, res) => {
        const { token } = req.body;
        jwt.verify(token, 'dc7fea65a4w2s3w4a5w5w5f6g4r5y2f0', function (err, decoded) {

            dbcon.collection("user").findOne({ _id: ObjectId(decoded._id) }, {
                projection: {
                    name: 0,
                    age: 0,
                    weight: 0,
                    height: 0,
                    gender: 0,
                    tel: 0,
                    email: 0,
                    password: 0,
                    img_path: 0,
                }
            }, (err, result) => {
                if (err) throw (err);
                res.json({ history: result.Bill });
            })
        })
    })

    app.post('/updateprofile', (req, res) => {
        const { token, name_surname, age, weight, height, gender, tel } = req.body;
        jwt.verify(token, 'dc7fea65a4w2s3w4a5w5w5f6g4r5y2f0', async function (err, decoded) {
            async function mvFileone() {
                return new Promise((resolve, reject) => {
                    const fileName = UniqueStringGenerator.UniqueStringId() + "." +
                        req.files.image_path.name.split(".").slice(-1)[0];
                    req.files.image_path.mv(__dirname + "/images/" + fileName, err => {
                        if (err) throw err;
                        resolve(fileName);
                        filesBucket.upload(__dirname + "/images/" + fileName, (err, file) => {
                            if (err) throw err;
                            fs.unlinkSync(__dirname + "/images/" + fileName);
                        })
                    })
                })
            }
            let fileName = ''
            if (req.files) {
                fileName = await mvFileone()
            }
            const dataSet = {
                $set: {
                    name: name_surname,
                    age: age,
                    weight: weight,
                    height: height,
                    gender: gender,
                    tel: tel,
                    img_path: fileName,
                }
            }

            if (!name_surname) delete dataSet.$set.name_surname;
            if (!age) delete dataSet.$set.age;
            if (!weight) delete dataSet.$set.weight;
            if (!height) delete dataSet.$set.height;
            if (!gender) delete dataSet.$set.gender;
            if (!tel) delete dataSet.$set.tel;
            if (!req.files) delete dataSet.$set.img_path

            dbcon.collection("user").update({ _id: ObjectId(decoded._id) }, dataSet,
                (err, result) => {
                    if (err) throw err;
                    if (result) res.json("สำเร็จ")
                    else res.json("ไม่สำเร็จ")

                })
        })
    })

    app.post('/dataprofile', (req, res) => {
        const { token } = req.body;
        jwt.verify(token, 'dc7fea65a4w2s3w4a5w5w5f6g4r5y2f0', function (err, decoded) {
            dbcon.collection("user").findOne({ _id: ObjectId(decoded._id) }, { projection: { Bill: 0, password: 0 } }, (err, result) => {
                res.json({ user: result })
            })
        })
    })

    app.post('/deletecouse', (req, res) => {
        const { id } = req.body;
        dbcon.collection("course").remove({ _id: ObjectId(id) }, (err, result) => {
            if (result) {
                res.send("สำเร็จ")
            }
        });
    })

    app.post('/insertcouse', async (req, res) => {
        const { name, detail, numberlevel } = req.body;
        if (name && detail && numberlevel && req.files) {
            async function mvFile() {
                return new Promise((resolve, reject) => {
                    const fileName = UniqueStringGenerator.UniqueStringId() + "." +
                        req.files.img.name.split(".").slice(-1)[0];
                    req.files.img.mv(__dirname + "/images/" + fileName, err => {
                        if (err) throw err;
                        filesBucket.upload(__dirname + "/images/" + fileName, (err, file) => {
                            if (err) throw err;
                            fs.unlinkSync(__dirname + "/images/" + fileName);
                            resolve(fileName);
                        })
                    })
                })
            }
            const fileName = await mvFile();
            if (req.files) {
                if (err) throw err;
                dbcon.collection("course").insertOne({ name, detail, url: fileName, level: [], number: numberlevel }, (err, doc) => {
                    if (err) throw err;
                    res.send("success");
                })
            } else {
                res.send("unsuccess");
            }
        } else {
            res.send("incomplete")
        }
    })

    app.post('/udatacouse', (req, res) => {
        dbcon.collection("course").findOne({ _id: ObjectId(req.body.id) }, { projection: { level: 0 } }, (err, result) => {
            res.json({ result })
        })
    })

    app.post('/updatecouse', async (req, res) => {
        const { name, detail, id, number } = req.body

        async function mvFileone() {
            return new Promise((resolve, reject) => {
                const fileName = UniqueStringGenerator.UniqueStringId() + "." +
                    req.files.img.name.split(".").slice(-1)[0];
                req.files.img.mv(__dirname + "/images/" + fileName, err => {
                    if (err) throw err;
                    resolve(fileName);
                    filesBucket.upload(__dirname + "/images/" + fileName, (err, file) => {
                        if (err) throw err;
                        fs.unlinkSync(__dirname + "/images/" + fileName);
                    })
                })
            })
        }

        /* if (req.files) {
            req.files.img.mv(path.join(__dirname + "/../public/images/" + req.files.img.name), (err, resultMv) => {
                if (err) throw err;
            })
        } */

        let fileName = "";
        if (req.files) fileName = await mvFileone();
        const dataSet = {
            $set: {
                name, detail, url: fileName, number,
            }
        }
        if (!name) delete dataSet.$set.name;
        if (!detail) delete dataSet.$set.detail;
        if (!req.files) delete dataSet.$set.url;
        dbcon.collection("course").updateOne({ _id: ObjectId(id) }, dataSet, (err, doc) => {
            if (err) throw err;
            res.json({ status: "success" });
        })
    })

    app.get('/listcouse', (req, res) => {
        dbcon.collection("course").find({}, { projection: { catgory: 0, detail: 0, url: 0, level: 0, number: 0 } }).toArray((err, result) => {
            if (err) throw err
            res.json({ couse: result })
        })
    })

    app.post('/cousenoe', (req, res) => {
        const { id } = req.body
        dbcon.collection('course').findOne({ _id: ObjectId(id) }, (err, result) => {
            res.json({ level: result })
        })
    })

    app.post('/addlevel', async (req, res) => {
        const { name, level, id, price } = req.body
        if (name && level && id && price && req.files) {
            const { videos } = req.files
            async function mvFile(i) {
                return new Promise((resolve, reject) => {
                    const fileName = UniqueStringGenerator.UniqueStringId() + "." +
                        videos[i].name.split(".").slice(-1)[0];
                    videos[i].mv(__dirname + "/videos/" + fileName, err => {
                        if (err) throw err;
                        resolve(fileName);
                        filesBucket.upload(__dirname + "/videos/" + fileName, (err, file) => {
                            if (err) throw err;
                            fs.unlinkSync(__dirname + "/videos/" + fileName);
                        })
                    })
                })
            }

            async function mvFileone() {
                return new Promise((resolve, reject) => {
                    const fileName = UniqueStringGenerator.UniqueStringId() + "." +
                        videos.name.split(".").slice(-1)[0];
                    videos.mv(__dirname + "/videos/" + fileName, err => {
                        if (err) throw err;
                        resolve(fileName);
                        filesBucket.upload(__dirname + "/videos/" + fileName, (err, file) => {
                            if (err) throw err;
                            fs.unlinkSync(__dirname + "/videos/" + fileName);
                        })
                    })
                })
            }
            let arr = [];
            if (videos.length > 1) {
                for (let i = 0; i < videos.length; ++i) {
                    const fileName = await mvFile(i);
                    await arr.push(fileName);
                    if (i == videos.length - 1) {
                        dbcon.collection("course").findOne({ _id: ObjectId(id) }, { projection: { level: { $elemMatch: { level: level } } } }, (err, result) => {
                            if (err) throw err
                            if (result.level == undefined) {
                                dbcon.collection("course").update({ _id: ObjectId(id) }, {
                                    $push: {
                                        level: {
                                            date: date.date,
                                            name: name,
                                            level: level,
                                            price: price,
                                            video: arr
                                        }
                                    }
                                }, (err, result) => {
                                    if (result) {
                                        res.send("สำเร็จ")
                                    }
                                })
                            } else {
                                res.send("ไม่สำเร็จ")
                            }
                        })
                    }
                }
            } else {
                const fileName = await mvFileone()
                dbcon.collection("course").findOne({ _id: ObjectId(id) }, { projection: { level: { $elemMatch: { level: level } } } }, (err, result) => {
                    if (err) throw err
                    if (result.level == undefined) {
                        dbcon.collection("course").update({ _id: ObjectId(id) }, {
                            $push: {
                                level: {
                                    date: date.date,
                                    name: name,
                                    level: level,
                                    price: price,
                                    video: [
                                        fileName
                                    ]
                                }
                            }
                        }, (err, result) => {
                            if (result) {
                                res.send("สำเร็จ")
                            }
                        })
                    } else {
                        res.send("ไม่สำเร็จ")
                    }
                })
            }
        } else {
            res.send("ข้อมูลไม่คบ")
        }
    })

    app.post('/dataleve', (req, res) => {
        const { idd, levell } = req.body
        dbcon.collection('course').findOne({ _id: ObjectId(idd) }, { projection: { level: { $elemMatch: { level: levell } } } }, (err, result) => {
            if (err) throw err;
            res.json({ level: result.level[0] })
        })
    })

    app.post('/updatelevel/:id/:level', async (req, res) => {
        const id = req.params.id
        const level = req.params.level
        const { name, price, videoname } = req.body
        const { videos } = req.files
        const names = videoname.split(',');
        async function mvFile(i) {
            return new Promise((resolve, reject) => {
                const fileName = UniqueStringGenerator.UniqueStringId() + "." +
                    videos[i].name.split(".").slice(-1)[0];
                videos[i].mv(__dirname + "/videos/" + fileName, err => {
                    if (err) throw err;
                    resolve(fileName);
                    filesBucket.upload(__dirname + "/videos/" + fileName, (err, file) => {
                        if (err) throw err;
                        fs.unlinkSync(__dirname + "/videos/" + fileName);
                    })
                })
            })
        }
        async function mvFileone() {
            return new Promise((resolve, reject) => {
                const fileName = UniqueStringGenerator.UniqueStringId() + "." +
                    videos.name.split(".").slice(-1)[0];
                videos.mv(__dirname + "/videos/" + fileName, err => {
                    if (err) throw err;
                    resolve(fileName);
                    filesBucket.upload(__dirname + "/videos/" + fileName, (err, file) => {
                        if (err) throw err;
                        fs.unlinkSync(__dirname + "/videos/" + fileName);
                    })
                })
            })
        }

        let videonew = [];
        if (videos.length > 1) {
            for (let i = 0; i < videos.length; ++i) {
                const fileName = await mvFile(i);
                await videonew.push(fileName);
                if (i == videos.length - 1) {
                    let videoname = names.concat(videonew)
                    dbcon.collection('course').updateOne({ _id: ObjectId(id), "level.level": level },
                        {
                            $set: {
                                "level.$.name": name,
                                "level.$.price": price,
                                "level.$.video": videoname,
                            }
                        }, (err, result) => {
                            if (result) {
                                res.send("สำเร็จ")
                            }
                        })
                }
            }
        } else {
            const fileName = await mvFileone();
            await videonew.push(fileName);
            let videoname = names.concat(videonew)
            dbcon.collection('course').updateOne({ _id: ObjectId(id), "level.level": level },
                {
                    $set: {
                        "level.$.name": name,
                        "level.$.price": price,
                        "level.$.video": videoname,
                    }
                }, (err, result) => {
                    if (result) {
                        res.send("สำเร็จ")
                    }
                })
        }
    })

    app.post('/removelevel', (req, res) => {
        const { id, level } = req.body
        dbcon.collection('course').update({ _id: ObjectId(id) }, { '$pull': { level: { level: level } } }, (err, result) => {
            if (err) throw err
            res.json({ datae: "seccess" })
        })
    })

    app.post('/removevideo', (req, res) => {
        const { idd, videoname } = req.body
        dbcon.collection('course').update({ _id: ObjectId(idd) }, { '$pull': { level: { video: { videoname: videoname } } } }, (err, result) => {
            res.json({ datae: "seccess" })
        })
    })

    app.get('/couseone/:id', (req, res) => {
        const id = req.params.id
        dbcon.collection('course').findOne({ _id: ObjectId(id) }, (err, result) => {
            res.json({ couse: result })
        })
    })

    app.get('/userdata', (req, res) => {
        dbcon.collection('user').find({}, {
            projection: {
                age: 0,
                weight: 0,
                height: 0,
                gender: 0,
                password: 0,
                img_path: 0,
            }
        },
        ).toArray((err, result) => {
            if (err) throw err
            res.json({ user: result })
        })
    })

    app.post('/datauser/:id', (req, res) => {
        const id = req.params.id
        dbcon.collection('user').findOne({ _id: ObjectId(id) }, {
            projection: {
                age: 0,
                weight: 0,
                height: 0,
                password: 0,
                img_path: 0,
                Bill: 0,
            }
        }, (err, result) => {
            res.json({ datae: result })
        })
    })

    app.post('/databill/:id/:idcouse', (req, res) => {
        const id = req.params.id;
        const idbill = req.params.idcouse
        dbcon.collection('user').findOne({ _id: ObjectId(id) }, {
            projection: { Bill: { $elemMatch: { Id: idbill } } }
        }, (err, result) => {
            res.json({ bill: result.Bill[0] })
        })
    })

    app.post('/dasborad', (req, res) => {
        const { token } = req.body;
        jwt.verify(token, 'dc7fea65a4w2s3w4a5w5w5f6g4r5y2f0', function (err, decoded) {
            dbcon.collection('user').findOne({ _id: ObjectId(decoded._id) }, (err, result) => {
                res.json({ couse: result.Bill })
            })
        })
    })

    app.post('/billlevel', (req, res) => {
        const { token } = req.body
        jwt.verify(token, 'dc7fea65a4w2s3w4a5w5w5f6g4r5y2f0', function (err, decoded) {
            dbcon.collection('user').findOne({ _id: ObjectId(decoded._id) }, (err, result) => {
                res.json({ bill: result.Mycouse })
            })
        })
    })

    app.post('/approve', (req, res) => {
        const { id, idcouse, levelsname } = req.body
        dbcon.collection('user').updateOne({ _id: ObjectId(id), "Bill.Id": idcouse }, {
            $set: {
                "Bill.$.approve": true
            },
        }, (err, doc) => {
            dbcon.collection("user").findOne({ _id: ObjectId(id), }, { projection: { Bill: { $elemMatch: { Id: idcouse } } } }, (err, result) => {
                if (err) throw err;
                let array = []
                result.Bill[0].level.forEach(item => {
                    if (levelsname.some(f => f.name == item.name)) {
                        item.approve = true
                    }
                    array.push(item)
                })
                dbcon.collection('user').updateOne({ _id: ObjectId(id), "Bill.Id": idcouse }, {
                    $set: {
                        "Bill.$.level": array
                    }
                }, (err, results) => {
                    dbcon.collection('user').findOne({ _id: ObjectId(id) }, { projection: { _id: 0, Mycouse: { $elemMatch: { namecouse: result.Bill[0].namecouse } } } }, (err, Mycouse) => {
                        if (Mycouse.Mycouse === undefined) {
                            dbcon.collection('user').updateOne({ _id: ObjectId(id), }, {
                                $push: {
                                    "Mycouse": result.Bill[0]
                                }
                            })
                        } else {
                            /* dbcon.collection('user').updateOne({ _id: ObjectId(id), "Mycouse.namecouse": result.Bill[0].namecouse }, {
                                $push: {
                                    "Mycouse.$.level": []   
                                }
                            }) */
                            arr = []
                            result.Bill[0].level.forEach((item, index) => {
                                dbcon.collection('user').updateOne({ _id: ObjectId(id), "Mycouse.namecouse": result.Bill[0].namecouse }, {
                                    $push: {
                                        "Mycouse.$.level": item
                                    }
                                })
                            })

                        }
                    })
                    res.json({ re: result })
                })
            })
        })
    })

    app.post('/deletebill', (req, res) => {
        const { id, idcouse } = req.body
        dbcon.collection('user').update({ _id: ObjectId(id) }, { '$pull': { Bill: { Id: idcouse } } }, (err, result) => {
            if (err) throw err
            res.json({ datae: "seccess" })
        })
    })

    app.post('/cous', (req, res) => {
        const { bill } = req.body
        let arr = []
        bill.forEach((item, index) => {
            arr.push(ObjectId(item.idcours))
            if (index == bill.length - 1) {
                dbcon.collection('course').find({ _id: { $in: arr } }).toArray((err, result) => {
                    if (err) throw err
                    res.json({ couse: result })
                })
            }
        })


    })

    // level page

    app.post('/billlevel/:id', (req, res) => {
        const id = req.params.id;
        const { token } = req.body;
        jwt.verify(token, 'dc7fea65a4w2s3w4a5w5w5f6g4r5y2f0', function (err, decoded) {
            dbcon.collection('user').findOne({ _id: ObjectId(decoded._id), }, { projection: { Mycouse: { $elemMatch: { idcours: id } } } }, (err, result) => {
                res.json({ level: result.Mycouse[0] })
            })
        })
    })

    app.post('/video', (req, res) => {
        const { id, level } = req.body
        dbcon.collection('course').findOne({ _id: ObjectId(id) }, { projection: { level: { $elemMatch: { level: level } } } }, (err, result) => {
            res.json({ level: result.level[0] })
        })
    })

    app.get("/verify-bucket", (req, res) => {
        const storage = new Storage();
        async function listBuckets() {
            try {
                const results = await storage.getBuckets();

                const [buckets] = results;

                console.log('Buckets:');
                buckets.forEach(bucket => {
                    console.log(bucket.name);
                });
            } catch (err) {
                console.error('ERROR:', err);
            }
        }
        listBuckets();
    })

    app.get('/bank', (req, res) => {
        dbcon.collection('bank_account').findOne({ _id: ObjectId('60bcf6375cc9f56d81d68e99') }, (err, result) => {
            if (err) throw err
            res.json({ bank: result })
        })
    })

    app.post('/check-status', (req, res) => {
        const { token } = req.body
        jwt.verify(token, 'dc7fea65a4w2s3w4a5w5w5f6g4r5y2f0', async function (err, decoded) {
            dbcon.collection('user').findOne({ _id: ObjectId(decoded._id) }, (err, result) => {
                res.send(result.rights)
            })
        })
    })

})

app.listen(5000, () => {
    console.log("> App on port 5000");
})
