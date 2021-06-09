import styles from '../styles/Dasborad.module.css'
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom'
import axios from 'axios'

function Dasborad() {
    const [bill, setbill] = useState([])
    const [couses, setcouses] = useState([])
    const token = localStorage.getItem("token");
    const history = useHistory()
    useEffect(() => {
        axios({
            url: "http://localhost:5000/dasborad",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ token })
        }).then(res => {
            let bill  = res.data.couse.filter(e => e.approve)
            axios({
                url: "http://localhost:5000/cous",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({
                    bill : bill
                })
            }).then(ress => {
                setcouses(ress.data.couse)
            })
        })
    }, [])
    return (
        <div className={styles.bg_das}>
            <div className={styles.contents_das}>
                <h2 className={styles.title}>คอร์สของฉัน</h2>
                <div className={styles.cors}>
                    {couses ? couses.map((item, index) =>
                        <div onClick={() => history.push(`/level/${item._id}`)} key={index}>
                            <div style={{ background: `url(https://storage.googleapis.com/video-course/${item.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} className={styles.img}></div>
                            <div className={styles.btn}>
                                <h2 className={styles.namecors}>{item.name}</h2>
                                <button className={styles.btn_das}>ดูคอร์ส</button>
                            </div>
                        </div>
                    ):null
                    }
                </div>
            </div>
        </div>
    )
}
export default Dasborad;