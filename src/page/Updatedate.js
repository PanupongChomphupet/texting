import styles from '../styles/Updatedate.module.css';
import { useHistory } from 'react-router-dom';
import axios from 'axios'
import { useState, useEffect } from 'react'
import swal from 'sweetalert'
function Updatedate() {
  const history = useHistory()
  const [datauser, setdatauser] = useState([])
  const [preview, setPreview] = useState(null);
  const [from, setfrom] = useState({})
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios({
      method: "post",
      url: "http://localhost:5000/dataprofile",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ token })
    }).then(res => {
      const { name, age, weight, height, gender, tel, email, img_path } = res.data.user;
      setfrom({
        name_surname: name,
        age: age,
        weight: weight,
        height: height,
        gender: gender,
        tel: tel,
        email: email,
        image_path : '',
      })
      setPreview('https://storage.googleapis.com/video-course/' + img_path)
    })
  }, [])

  function updateprofile(e) {
    console.log (from)
    const token = localStorage.getItem("token");
    e.preventDefault()
    const formData = new FormData();
    formData.append('token', token)
    formData.append("name_surname", from.name_surname)
    formData.append("age", from.age)
    formData.append("weight", from.weight)
    formData.append("height", from.height)
    formData.append("gender", from.gender)
    formData.append("tel", from.tel)
    formData.append("email", from.email)
    formData.append("image_path", from.image_path)

    axios({
      method: "POST",
      url: "http://localhost:5000/updateprofile",
      headers: { "Content-Type": "application/json" },
      data: formData
    }).then(res => {
      if (res.data === "สำเร็จ") {
        swal({
          icon: "success",
          title: "บันทึกข้อมูลสำเร็จ"
        })
        history.push('/profile')
      } else {
        swal({
          icon: "warning",
          title: "บันทึกข้อมูลไม่สำเร็จ"
        })
      }
    })
  }
  function handleChoosepic(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function (e) {
      setPreview([reader.result]);
    }
    setfrom({...from, image_path: file });
  }
  return (
    <div>
      <div className={styles.bg}>
        <div className={styles.content}>
          <h2 className={styles.title}>แก้ไขโปรไฟล์</h2>
          <div className={styles.img}>
            <img src={preview} />
            <div className={styles.inputimg}><input type="file"
              onChange={handleChoosepic}
            /></div>
          </div>

          <div className={styles.inputs}>
            <label>ชื่อ-นามสกุล</label>
            <input
              type="text"
              value={from.name_surname}
              onChange={e => setfrom({ ...from, name_surname: e.target.value })}
            />
            <label>อายุ</label>
            <input
              type="number"
              value={from.age}
              onChange={e => setfrom({ ...from, age: e.target.value })}
            />
            <label>น้ำหนัก</label>
            <input
              type="number"
              value={from.weight}
              onChange={e => setfrom({ ...from, weight: e.target.value })}
            />
            <label>ส่วนสูง</label>
            <input
              type="number"
              value={from.height}
              onChange={e => setfrom({ ...from, height: e.target.value })}
            />
            <label>เพศ</label>
            <input
              type="text"
              value={from.gender}
              onChange={e => setfrom({ ...from, gender: e.target.value })}
            />
            <label>เบอร์โทรศัพท์</label>
            <input
              type="text"
              value={from.tel}
              onChange={e => setfrom({ ...from, tel: e.target.value })}
            />
          </div>
          <div className={styles.btn}>
            <button onClick={() => { history.push('/profile') }}>ยกเลิก</button>
            <button onClick={updateprofile}>ยืนยัน</button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Updatedate;