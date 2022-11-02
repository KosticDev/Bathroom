import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { SubHeaderContent } from "./SubHeaderContent";

export function SubHeader(props) {
  const {
    show,
    setShow,
    header,
    setHeader,
    categories,
    isCategory,
    setIsCategory,
  } = props;
  const [isAllCategories, setIsAllCategories] = useState(false);
  const { isAdd, setAdd } = useState(false);
  const [secondHeader, setSecondHeader] = useState(header);
  let subCategoryData = [];

  function init() {
    if (header === "Baths & Spas") {
      subCategoryData = ["Freestandig baths", "Built In baths", "Corner baths", "Spa baths"];
    }
    if (header === "Vanities") {
      subCategoryData = ["Wall hung Vanity", "To floor Vanity", "Corner Vanity"];
    }
    if (header === "Shavers & Mirrors") {
      subCategoryData = ["Shaving Cabinets", "Mirrors"];
    }
    if (header === "Basins") {
      subCategoryData = [
        "Above counter",
        "Wall Hung",
        "Undermount",
        "Semi Inset",
      ];
    }
    if (header === "Showers") {
      subCategoryData = ["Walk Around", "Corner", "Frameless", "Semi Frameless"];
    }
    if (header === "Tapware & Accessories") {
      subCategoryData = ["Mixers", "Showers", "Bidet", "Accessories"];
    }
    if (header === "Toilets") {
      subCategoryData = [
        "Back to wall",
        "InWall",
        "Bidet Toilet Seat",
        "Wall hung",
      ];
    }
    if (header === "Wastes & Plumbing") {
      subCategoryData = ["Tile insert", "Bar Grates"];
    }
  }

  init();
  const Theader = header;
  console.log(Theader, "DFadfadfad7r9q7ru9fdsi");

  function Hchange(header) {
    setIsAllCategories(true);
    setHeader(header);
  }

  return (
    <div className="d-flex flex-wrap w-100 p-4">
      <div className="d-flex flex-wrap w-100 m-2 b_title">
        <span>
          <img
            src="assets/ui/left-arrow.svg"
            style={{ width: "12px", marginRight: "5px" }}
          />
        </span>
        <p onClick={() => setIsCategory(false)}>All Categories</p>
        {isAllCategories ? (
          <>
            <span>
              <img
                src="assets/ui/left-arrow.svg"
                style={{ width: "12px", marginRight: "5px" }}
              />
            </span>
            <p onClick={() => setIsAllCategories(false)}>{secondHeader}</p>
          </>
        ) : (
          ""
        )}
      </div>
      <div className="d-flex flex-wrap w-100 b_title">
        <h4>{isAllCategories ? header : secondHeader}</h4>
      </div>
      {isAllCategories ? (
        <SubHeaderContent
          categories={categories}
          isAdd={isAdd}
          setAdd={setAdd}
          loadBathtub={props.loadBathtub}
          loadBathtub2={props.loadBathtub2}
          loadTapware={props.loadTapware}
          shower={props.shower}
          show={show}
          setShow={setShow}
        />
      ) : (
        <div className="d-flex flex-wrap w-100">
          {subCategoryData.map((data) => {
            return (
              <div
                className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm"
                key={uuidv4()}
              >
                <div
                  className="d-flex cursor"
                  onClick={() => Hchange(data)}
                >
                  <span>{data}</span>
                  <span>
                    <img src="assets/ui/arrow-right.svg" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
