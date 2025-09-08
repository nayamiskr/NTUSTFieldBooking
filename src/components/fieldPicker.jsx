import './fieldPicker.css';
import layouts from './outFieldLayout.json';

function FieldPicker({ fieldName, onSelectField, selectedId }) {
    let layout = null;
    layout = layouts[fieldName];

    if (!layout) {
        return <div className="field-diagram-error">找不到「{String(fieldName)}」的場地資料</div>;
    }

    // 2) 取得 viewBox 與資料
    const vb = { w: 1000, h: 600 };

    const areas = layout.areas;
    const fixtures = Array.isArray(layout.fixtures) && layout.fixtures.length > 0
        ? layout.fixtures
        : defaultFixtures(vb);

    const handlePick = (id) => {
        const nextId = id === selectedId ? null : id;
        onSelectField({ id: nextId });
    }
    return (
        <div className="field-picker">
            <svg
                viewBox={`0 0 ${vb.w} ${vb.h}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                role="img"
            >
                {/* Areas: 可被選取的區塊 */}
                {areas.map((a) => {
                    const isSelected = a.id === selectedId;
                    const isDisabled = a.status === 'blocked';
                    const fill = isDisabled ? '#7d7d7dff' : isSelected ? '#3f7cff' : '#d9d9d9';
                    const stroke = isSelected ? 'rgba(63,124,255,0.6)' : 'transparent';
                    const cardSize = (a.hori === true)? { w: 220, h: 140 } : { w: 140, h: 220 }


                    return (
                        <g key={a.id}
                            onClick={() => handlePick(a.id)}
                            style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                            aria-label={String(a.label ?? a.id)}
                        >
                            <rect
                                x={a.x} y={a.y} width={cardSize.w} height={cardSize.h}
                                rx={10}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth={isSelected ? 6 : 0}
                                vectorEffect="non-scaling-stroke"
                            />

                            {/* 置中文字 */}
                            <text
                                x={a.x + cardSize.w / 2}
                                y={a.y + cardSize.h / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="area-label"
                                fontSize={a.fontSize ?? 28}
                                fill={isDisabled ? '#9e9e9eff' : isSelected ? '#fff' : '#333'}
                            >
                                {a.label ?? a.id}
                            </text>

                        </g>
                    );
                })}

                {/* Fixtures */}
                <g pointerEvents="none">
                    {fixtures.map((f, idx) => {
                        const isDoor = f.type === 'door';
                        const fill = f.fill || (isDoor ? '#10c900' : '#666');
                        return (
                            <g key={idx}>
                                <rect
                                    x={f.x} y={f.y} width={f.w} height={f.h}
                                    rx={f.rx ?? 6}
                                    fill={fill}
                                />
                                {f.text && (
                                    <text
                                        x={f.x + f.w / 2}
                                        y={f.y + f.h / 2}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="fixture-label"
                                        fontSize={f.fontSize ?? 16}
                                        fill="#fff"
                                    >
                                        {f.text}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
    );
}

function defaultFixtures(vb) {
    return [
        { type: 'door', x: vb.w - 80, y: vb.h - 180, w: 40, h: 120, text: '入口' }
    ];
}

export default FieldPicker;