import { FuturisticPanel } from '../FuturisticPanel';

export function SystemSettings() {
  return (
    <div className="space-y-6 h-full flex flex-col">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-200">系统设置 (Settings)</h2>
          <p className="text-gray-400 text-sm">Configure system parameters and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <FuturisticPanel title="General">
            <div className="space-y-4">
               <div className="flex justify-between items-center p-2 rounded bg-gray-900/30">
                  <span className="text-gray-300">System Language</span>
                  <select className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white">
                     <option>中文 (Simplified)</option>
                     <option>English</option>
                  </select>
               </div>
               <div className="flex justify-between items-center p-2 rounded bg-gray-900/30">
                  <span className="text-gray-300">Theme</span>
                  <select className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white">
                     <option>Dark (Cyber)</option>
                     <option>Light (Classic)</option>
                  </select>
               </div>
            </div>
         </FuturisticPanel>

         <FuturisticPanel title="Notifications">
            <div className="space-y-4">
               <div className="flex justify-between items-center p-2 rounded bg-gray-900/30">
                  <span className="text-gray-300">Alert Sounds</span>
                  <input type="checkbox" defaultChecked className="toggle-checkbox" />
               </div>
               <div className="flex justify-between items-center p-2 rounded bg-gray-900/30">
                  <span className="text-gray-300">Push Notifications</span>
                  <input type="checkbox" defaultChecked className="toggle-checkbox" />
               </div>
            </div>
         </FuturisticPanel>
      </div>
    </div>
  );
}
