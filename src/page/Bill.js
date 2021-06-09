import styles from '../styles/Bill.module.css'
import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom';
import { atom, useRecoilState } from 'recoil'
import axios from 'axios'
const velState = atom({
    key: "vel",
    default: []
})
function Bill() {
    const history = useHistory()
    const [vel, setvel] = useRecoilState(velState)
    const [num, setnum] = useState(0)
    const [map, setmap] = useState([])
    const [from , setfrom] = useState ({
        
    });
    useEffect(() => {
        let nums = 0;
        vel.forEach((item, index) => {
            nums += item.price;
            if (index == vel.length - 1) setnum(nums)
        })
    }, []);
    console.log(vel)
    function path () {
        axios ({
            method : "POST",
            url: "http://localhost:5000/bill-ckeck",
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
               namecouse : "piratid",
               level : vel,
               sumprice : num,
            })
        })
        history.push("/home")
    }
    return (
        <div className={styles.bg_bill}>
            <div className={styles.content}>
                <h2 className={styles.title}>พิราทิศ</h2>
                <div className={styles.border} />
                <div className={styles.bill}>
                    <h4 className={styles.bill_title}>รวมคอร์สทั้งหมด </h4>
                    <div className={styles.level}>
                        {vel.map((item, index) =>
                         <div key = {index}>
                         <p>เลเวลที่ {item.level}:{item.name}<span className={styles.price}>{item.price} บาท</span></p>
                         </div>)}
                    </div>
                    <div className={styles.sumprice}>
                        <p className = {styles.sumprices}>ราคารวม <span className={styles.price}>{num} บาท</span></p>
                    </div>
                </div>

                <div className={styles.conlect}>
                    <h3>ขอบคุณที่อุดหนุนคอร์สของเรา</h3>
                    <div className={styles.border_conlect} />
                    <p>รออนุญาตจากทีมงาน</p>
                    <button onClick={path} className={styles.btn_conlect}>กลับไปที่หน้าแรก</button>
                </div>
            </div>
        </div>
    )
}
export default Bill;