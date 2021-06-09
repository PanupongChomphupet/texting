import styles from '../styles/Addlevel.module.css'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import Select from 'react-select';
import swal from 'sweetalert'
import { GrAddCircle } from 'react-icons/gr'
import { IoMdRemoveCircleOutline } from 'react-icons/io'
import axios from 'axios'
import { Progress } from 'react-sweet-progress';
import "../../node_modules/react-sweet-progress/lib/style.css";
import { FiChrome } from 'react-icons/fi'


function Addlevel() {
    const [optionsss, setoptionsss] = useState([])
    const [number, setnumber] = useState([])
    const [id, setid] = useState('')
    const history = useHistory();
    const [loaded, setLoaded] = useState(-1);
    const [video, setvideo] = useState([])
    const [form, setform] = useState({
        name: '',
        level: 0,
        price: 0,

    })
    function checkstatus() {
        const token = localStorage.getItem("token");
        axios({
            method: 'POST',
            url: 'http://localhost:5000/check-status',
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ token })
        }).then(res => {
            if (res.data !== 'admin') {
                history.push("/home");
            }
        })
    }

    useEffect(() => {
        axios({
            method: "GET",
            url: "http://localhost:5000/listcouse",
            headers: { "Content-Type": "application/json" }
        }).then(res => {
            let arr = []
            res.data.couse.forEach((item, index) => {
                arr.push({
                    value: item._id, label: item.name
                })
                if (index == res.data.couse.length - 1) setoptionsss(arr)
            })
        })
        checkstatus()
    }, [])

    function data(id) {
        setid(id)
        axios({
            method: "post",
            url: "http://localhost:5000/cousenoe",
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ id })
        }).then(res => {
            let arr = []
            for (let i = 0; i < res.data.level.number; ++i) {
                if (res.data.level.level[i] === undefined) {
                    let a = i + 1
                    arr.push({
                        value: (a), label: (a)
                    })

                }
                if (i == res.data.level.number.length - 1) setnumber(arr)
            }

        })
    }

    function record(e) {
        e.preventDefault();
        const formdata = new FormData();
        formdata.append("id", id)
        formdata.append("name", form.name)
        formdata.append("level", form.level)
        formdata.append("price", form.price)

        for (let i = 0; i <= video.length; ++i) {
            formdata.append("videos", video[i]);
            if (i == video.length - 1) {
                axios({
                    method: "POST",
                    url: "http://localhost:5000/addlevel",
                    headers: { "Content-Type": "multipary/form-data" },
                    data: formdata,
                    onUploadProgress: (e) => {
                        if (e.lengthComputable) {
                            setLoaded((e.loaded * 100 / e.total + "%").split(".")[0])
                        }
                    }
                }).then(res => {
                    if (res.data === "สำเร็จ") {
                        swal({
                            icon: "warning",
                            title: "กำลังอัพโหลดวิดิโออาจใช้เวลาสักครู่"
                        })
                        history.push('/dasboradadmin')
                    } else if (res.data === "ไม่สำเร็จ") {
                        swal({
                            icon: "warning",
                            title: "มีข้อมูลแล้ว"
                        })
                    } else {
                        swal({
                            icon: "info",
                            title: "กรอกข้อมูลไม่ครบ"
                        })
                    }
                })
            } else {
                axios({
                    method: "POST",
                    url: "http://localhost:5000/addlevel",
                    headers: { "Content-Type": "multipary/form-data" },
                    data: formdata,
                }).then(res => {
                    if (res.data === "ข้อมูลไม่คบ") {
                        swal({
                            icon: "info",
                            title: "กรอกข้อมูลไม่ครบ"
                        })
                    }
                })
            }
        }
    }

    return (
        <div className={styles.bg}>
            <div className={styles.hearder}>
                <h2 className={styles.titledas}>เพิ่มเลเวลใหม่</h2>
                <div className={styles.border}></div>
            </div>
            <p className={styles.namecouse}>ระบุคอร์ส</p>
            <div className={styles.selectnamecouse}>
                <Select options={optionsss} onChange={(e) => { data(e.value) }} />
            </div>
            <p className={styles.namecouse}>เลเวล</p>
            <div className={styles.selectlavel}>
                <Select options={number} onChange={e => setform({ ...form, level: e.value })} />
            </div>
            <div className={styles.inputs}>
                <label>ชื่อเลเวล</label>
                <input type="text"
                    onChange={e => setform({ ...form, name: e.target.value })}
                />
                <label>ราคา</label>
                <input
                    type="number"
                    onChange={e => setform({ ...form, price: e.target.value })}
                />
                <label>เพิ่มวิดิโอ</label>
                <input type="file" multiple
                    onChange={e => setvideo(e.target.files)} />
            </div>
            <div className={styles.upload}>
                {loaded > -1 ? <Progress percent={loaded} /> : null}
            </div>
            <div className={styles.btn}>
                <button onClick={record} className={styles.btnb}>ยันยัน</button>
            </div>
        </div>
    )
}
export default Addlevel;

{/* <div className={styles.addlevel}>
                <p className={styles.addvel}>เพิ่มเลเวลใหม่</p>
                <div className={styles.icon}>
                    <a onClick={addlevels}><GrAddCircle /></a>
                    <a onClick={deletecouse}><IoMdRemoveCircleOutline /></a>
                </div>
            </div> */}
{/* <div className={styles.level}>
                <p className={styles.leveltext}>เลเวล :<text> dwasdw </text></p>
                <div className={styles.btnadd}>
                    <button className={styles.btnb}>เพิ่มข้อมูล</button>
                </div>

            </div> */}