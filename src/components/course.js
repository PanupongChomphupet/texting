import styles from '../styles/course.module.css';
import { useState, useEffect } from 'react'
/* import axios from 'axios' */
import { useHistory } from 'react-router-dom';


function Course(props) {
    const history = useHistory();
    const { couses } = props

    return (
        <div className={styles.bg}>
            <div onClick={(e) => { history.push(`/detail/${couses._id}`) }} className={styles.cors}>
                <div style={{ background: `url(https://storage.googleapis.com/video-course/${couses.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} className={styles.img}></div>
                <div className={styles.btn}>
                    <h2 className = {styles.title}>{couses.name}</h2>
                    <button className={styles.btn_select}>เลือก</button>
                </div>
            </div>
        </div>
    )
}

export default Course