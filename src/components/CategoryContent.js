export function CategoryContent(props) {
    return (
        <div className="d-flex flex-wrap w-100">
            <div className="d-flex flex-wrap w-100 cards1">
                <div className='card d-flex align-items-center text-center p-2 rounded card1'>
                    <span className='m-2'>Baths & Spas</span>
                    <img style={{ width: "70px", scale: "2" }} className='m-3 p-2' src="assets/ui/e09acac1-fc05-4078-bd84-73b765c26c31.png"></img>
                    <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.loadBathtub()}>Add to Plan +</div>
                </div>
                <div className='card d-flex align-items-center text-center p-2 rounded card1'>
                    <span className='m-2'>Window</span>
                    <img style={{ width: "70px" }} src="assets/ui/window.svg"></img>
                    <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.loadBathtub2()}>Add to Plan +</div>
                </div>
            </div>
        </div>)
}