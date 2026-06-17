import React from 'react';

const StatCard = ({ title, value, icon, bgColor = "bg-blue-50" }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center space-x-4 transition-all duration-300 hover:shadow-md h-full">
    <div className={`p-4 ${bgColor} rounded-2xl flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate" title={title}>{title}</p>
      <h3 className="text-3xl font-extrabold text-slate-800 mt-1 truncate">{value}</h3>
    </div>
  </div>
);

export default StatCard;
