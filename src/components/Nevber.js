import styles from '../styles/Navber.module.css'
import { Link } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi'
import { HiUserCircle } from 'react-icons/hi'
import { text } from 'body-parser';
import { useHistory } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
function Navber(props) {
    const { rights } = props
    const token = localStorage.getItem("token");
    const history = useHistory()
    function myLinks() {
        var x = document.getElementById("myLinks")
        if (x.style.display === "block") {
            x.style.display = "none";
        } else {
            x.style.display = "block";
        }
    }
    function ppath() {
        history.push('/login')
        localStorage.removeItem('token')
    }
    function check(value) {
        if (value == "home") {
            history.push('/home')
        }else if (value == "dasborad" ){
            history.push('/dasborad')
        }else if (value == "dasboradadmin" ){
            history.push('/dasboradadmin')
        }else if (value == "userdata" ){
            history.push('/userdata')
        }else if (value == "insertdata" ){
            history.push('/insertdata')
        }else if (value == "addlevel" ){
            history.push('/addlevel')
        }else {
            ppath()
        }
        
        
        document.getElementById("myLinks").style.display = 'none'
    }

    function user() {
        return (
            <nav>
                <div className={styles.bg_navber}>
                    <div className={styles.content}>
                        <h1 className={styles.nav_title}>VPilates</h1>
                        <div className={styles.nav_menu} id="myLinks">
                            <a onClick={() => check("home")}>คอร์สเรียนทั้งหมด</a>
                            <a onClick={() => check("dasborad")} >คอร์ดรียนของฉัน</a>
                        </div>
                        <div className={styles.icon}>
                            <a className={styles.iconuser} onClick={(e) => { history.push('/profile') }} ><HiUserCircle /></a>
                            <a className={styles.iconmenu} onClick={myLinks}><FiMenu /></a>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }
    function admin() {
        return (
            <nav>
                <div className={styles.bg_navber}>
                    <div className={styles.content}>
                        <h1 className={styles.nav_title}>VPilates</h1>
                        <div className={styles.nav_menu} id="myLinks">
                            <a onClick={() => check('dasboradadmin')}>รายการคอร์ส</a>
                            <a onClick={() => check('userdata')}>รายการสั่งซื้อ</a>
                            <a onClick={() => check('insertdata')}>เพิ่มคอร์ส</a>
                            <a onClick={() => check('addlevel')}>เพิ่มเลเวล</a>
                            <a onClick={() => check('logout')}>ออกจากระบบ</a>
                        </div>
                        <div className={styles.icon}>
                            <a className={styles.iconmenu} onClick={myLinks}><FiMenu /></a>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }
    function login() {
        return (
            <nav>
                <div className={styles.bg_navber}>
                    <div className={styles.content}>
                        <h1 className={styles.nav_title}>VPilates</h1>
                        {/* <div className={styles.nav_menu} id="myLinks">
                            <a onClick={(e) => history.push('/dasboradadmin')}>รายการคอร์ส</a>
                            <a onClick={(e) => history.push('/userdata')}>รายการสั่งซื้อ</a>
                            <a onClick={(e) => history.push('/insertdata')}>เพิ่มคอร์ส</a>
                            <a onClick={(e) => history.push('/addlevel')}>เพิ่มเลเวล</a>
                            <a onClick={ppath}>ออกจากระบบ</a>
                        </div> */}
                        {/* <div className={styles.icon}>
                            <a className={styles.iconmenu} onClick={myLinks}><FiMenu /></a>
                        </div> */}
                    </div>
                </div>
            </nav>
        );
    }

    if (rights === "user") {
        return user()
    } else if (rights === "admin") {
        return admin()
    } else {
        return user()
    }


}
export default Navber
