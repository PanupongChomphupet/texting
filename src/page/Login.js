import axios from 'axios'
import { useState } from 'react'
import { Link, useHistory } from 'react-router-dom';
import styles from '../styles/Lojgin.module.css'
import swal from 'sweetalert'
function Login() {
    const [username, setusername] = useState("")
    const [password, setpassword] = useState("")
    const history = useHistory();
    function sendData(e) {
        e.preventDefault()
        axios({
            method: "POST",
            url: "http://localhost:5000/login",
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
                tel: username,
                password: password
            })
        }).then(result => {
            if (!result.data.token) {
                swal({
                    icon: "error",
                    title: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
                })
            } else {
                if (result.data.right == 'user') {
                    history.push('/home')
                    localStorage.setItem("token", result.data.token);
                } else if (result.data.right == "admin") {
                    history.push('/dasboradadmin')
                    localStorage.setItem("token", result.data.token);
                }
            }
        })
    }

    return (
        <div>
            <div className={styles.login_harder}>
                <form action="" className={styles.login}>
                    <h2 className={styles.title}>ลงชื่อเข้าใช้งาน</h2>
                    <div className={styles.border_button} />
                    <div className={styles.input_login}>
                        <input type="text"
                            placeholder="เบอร์โทรศัพท์"
                            onChange={e => { setusername(e.target.value) }}
                        />
                    </div>
                    <div className={styles.input_login}>
                        <input
                            type="password"
                            placeholder="รหัสผ่าน"
                            onChange={e => { setpassword(e.target.value) }}
                        />
                    </div>
                    <input
                        type="submit"
                        value="เข้าสู้ระบบ"
                        className={styles.btn_login}
                        onClick={sendData}
                    />
                    <div className={styles.border_button1} />
                    <p className={styles.member_login}>ยังไม่เป็นสมาชิก ?<Link onClick={() => history.push('/register')} className={styles.register}> สมัครเลย</Link></p>
                </form>
            </div>
        </div>
    )
}
export default Login