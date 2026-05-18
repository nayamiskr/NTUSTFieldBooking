export function InputElement({ label, name, type, placeholder }) {
    return (
        <div>
            <label className="block text-start text-gray-600 mb-1" htmlFor="email">{label}</label>
            <input name={name} type={type} placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
    )
}