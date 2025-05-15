import React from 'react'

const Title = ({ text1, text2 }) => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-800">
        <span className="text-blue-600">{text1}</span> {text2}
      </h2>
      <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
    </div>
  )
}

export default Title
