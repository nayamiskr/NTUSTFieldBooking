import './fieldPicker.css';
import { useState } from 'react';

function FieldPicker({ areaList, onSelectField }) {
    const [selectedNum, setSelectedNum] = useState(null);

    const handleClick = (num) => {
        setSelectedNum(num);
        onSelectField(num);
    };

    return (
        <div className="field-diagram">
            <div className="grid-container">
                {areaList.map((num) => (
                    <div
                        key={num}
                        className={`grid-box ${selectedNum === num ? 'selected' : ''}`}
                        onClick={() => handleClick(num)}
                    >
                        {num}
                    </div>
                ))}
                <div className='door'>
                    入口
                </div>    
            </div>
        </div>
    );
}

export default FieldPicker;