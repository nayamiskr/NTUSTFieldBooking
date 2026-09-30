export function InputElement({ label, name, type, placeholder, className, required = false, ...inputProps }) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-semibold text-slate-700">
                {label} {required && <span className="text-red-600">*</span>}
            </label>
            <input id={name} name={name} type={type} placeholder={placeholder} required={required} {...inputProps}
                className={className || "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"} />
        </div>
    )
}
