import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./Firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";

export function SubHeaderContent(props) {
  const { setShow, category, subCategory, keyRefresh } = props;
  const [modelDatas, setModelData] = useState([]);
  console.log(category);
  console.log(subCategory);

  const fetchData = async () => {
    let tempDatas = [];
    await getDocs(collection(db, "model_data")).then((querySnapshot) => {
      const newData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      if (newData !== undefined && newData !== null) {
        for (let i = 0; i < newData.length; i++) {
          let data = newData[i].data;
          if (data.category === category && data.subCategory ===subCategory)
          {
            data.id = newData[i].id;
            tempDatas.push(data);
          }
        }
        setModelData(tempDatas);
        console.log(tempDatas);
      }
    });
  };

  const DeleteData = async (id) => {
    const docRef = doc(db, "model_data", id); 
    deleteDoc(docRef) .then(() => { console.log("Entire Document has been deleted successfully.") }) .catch(error => { console.log(error); })
    fetchData();
    
  };
  useEffect(() => {
    fetchData();
  }, [keyRefresh]);

  return (
    <div className="d-flex flex-wrap w-100 calc">
      {modelDatas.map((data) => {
        return (
          <div
            key={uuidv4()}
            className="card d-flex align-items-center text-center p-2 rounded card1 marr"
          >
            <p className="m-2" style={{ maxWidth: "150px", minHeight: "65px" }}>
              {data.title}
            </p>
            <img
              style={{ width: "70px", scale: "1.2" }}
              className="m-3 p-2"
              src={data.imageUrl}
            ></img>
            <div
              className="btn m-1 rounded-5 shadow-sm"
              onClick={() => props.loadModel(data.modelUrl)}
            >
              Add to Plan +
            </div>
            {localStorage.getItem("bathroom_isOwner") === "false" ? (
              ""
            ) : (
              <div
                className="btn m-1 rounded-5 shadow-sm"
                onClick={() => DeleteData(data.id)}
              >
                Delete
              </div>
            )}
          </div>
        );
      })}
      {localStorage.getItem("bathroom_isOwner") === "false" ? (
        ""
      ) : (
        <div className="create" onClick={() => setShow(true)}>
          <p>Create</p>
        </div>
      )}
    </div>
  );
}

/*
<div className="card d-flex align-items-center text-center p-2 rounded card1 marr">
        <span className="m-2">Bath & Spas</span>
        <img
          style={{ width: "70px", scale: "1.2" }}
          className="m-3 p-2"
          src="assets/ui/e09acac1-fc05-4078-bd84-73b765c26c31.png"
        ></img>
        <div
          className="btn m-1 rounded-5 shadow-sm"
          onClick={() => props.loadBathtub("assets/doors/bath1.gltf")}
        >
          Add to Plan +
        </div>
      </div>
      <div className="card d-flex align-items-center text-center p-2 rounded card1 marr">
        <span className="m-2">Window</span>
        <img
          style={{ width: "70px", scale: "1.2" }}
          className="m-3 p-2"
          src="assets/ui/window.svg"
        ></img>
        <div
          className="btn m-1 rounded-5 shadow-sm"
          onClick={() =>
            props.loadBathtub2("assets/doors/bath2.gltf", 0.58, 0.3)
          }
        >
          Add to Plan +
        </div>
      </div>
      <div className="card d-flex align-items-center text-center p-2 rounded card1 marr">
        <span className="m-2">Shower</span>
        <img
          style={{ width: "70px", scale: "1.2" }}
          className="m-3 p-2"
          src="assets/ui/Showers.png"
        ></img>
        <div
          className="btn m-1 rounded-5 shadow-sm"
          onClick={() => props.shower()}
        >
          Add to Plan +
        </div>
      </div>
      <div className="card d-flex align-items-center text-center p-2 rounded card1 marr">
        <span className="m-2">Tapware</span>
        <img
          style={{ width: "70px", scale: "1.2" }}
          className="m-3 p-2"
          src="assets/ui/Tapware & Accessories.png"
        ></img>
        <div
          className="btn m-1 rounded-5 shadow-sm"
          onClick={() =>
            props.loadTapware("assets/doors/tapware.gltf", 0.05, 0.19, 0)
          }
        >
          Add to Plan +
        </div>
      </div>
      <div className="card d-flex align-items-center text-center p-2 rounded card1 marr">
        <span className="m-2">Wall Mix</span>
        <img
          style={{ width: "70px", scale: "1.2" }}
          className="m-3 p-2"
          src="assets/ui/Wall.png"
        ></img>
        <div
          className="btn m-1 rounded-5 shadow-sm"
          onClick={() =>
            props.loadTapware("assets/doors/Wall Mix.glb", 0, 0.35, 0.25)
          }
        >
          Add to Plan +
        </div>
      </div>
      <div className="card d-flex align-items-center text-center p-2 rounded card1 marr">
        <span className="m-2">Waverley</span>
        <img
          style={{ width: "70px", scale: "1.2" }}
          className="m-3 p-2"
          src="assets/ui/Vanity Bag Tex 1.952.png"
        ></img>
        <div
          className="btn m-1 rounded-5 shadow-sm"
          onClick={() =>
            props.loadBathtub2(
              "assets/doors/Waverley Without Bottom.glb",
              0.5,
              0.29
            )
          }
        >
          Add to Plan +
        </div>
      </div>
      <div className="card d-flex align-items-center text-center p-2 rounded card1 marr">
        <span className="m-2">Wall Mix</span>
        <img
          style={{ width: "70px", scale: "1.2" }}
          className="m-3 p-2"
          src="assets/ui/modern.JPG"
        ></img>
        <div
          className="btn m-1 rounded-5 shadow-sm"
          onClick={() =>
            props.loadTapware(
              "assets/doors/modern brass cioso color/cioso wall bath set brushed brass.glb",
              0,
              0,
              0
            )
          }
        >
          Add to Plan +
        </div>
      </div>
*/
