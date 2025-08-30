import React, { useState } from 'react';

const Settings = ({setactive}) => {
  const [activeTab, setActiveTab] = useState(1);

  const tabs = [
    { name: "Allergens", id: 1 },
    { name: "Ingredients", id: 2 },
    { name: "Protein Sources", id: 3 },
  ];

  return (
    <div className="shadow-sm rounded-xl w-full bg-white h-[calc(100vh-77px)] p-4 flex flex-col">
      <div className="tabs grid sm:grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => { setActiveTab(tab.id) , setactive(`Settings/${tab.name}`)}}
            className={`cursor-pointer flex justify-center items-center h-40 rounded transition 
              ${activeTab === tab.id ? "bg-[#2A3C47] text-white shadow-md" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            {tab.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
