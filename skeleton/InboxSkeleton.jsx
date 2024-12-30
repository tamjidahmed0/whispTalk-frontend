export default function InboxSkeleton() {
    return (
      <div className="grid grid-rows-[10%_80%_10%] h-screen animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-evenly border-b border-gray-500">
          <div className="flex items-center gap-5">
            <div className="w-[50px] h-[50px] rounded-full bg-gray-300" />
            <div>
              <div className="w-24 h-4 bg-gray-300 rounded mb-2"></div>
              <div className="w-16 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
          </div>
        </div>
  
        {/* Body */}
        <div className="overflow-y-auto p-4">
          {/* Profile Picture and Info */}
          <div className="flex flex-col items-center mt-10">
            <div className="w-[80px] h-[80px] rounded-full bg-gray-300"></div>
            <div className="flex flex-col items-center mt-3">
              <div className="w-32 h-5 bg-gray-300 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-300 rounded mb-1"></div>
              <div className="w-20 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
  
          {/* Messages */}
          <div className="mt-10 space-y-4">
            {/* Incoming Message */}
            <div className="flex items-end">
              <div className="w-[40px] h-[40px] rounded-full bg-gray-300"></div>
              <div className="bg-gray-300 rounded-xl ml-4 p-4 w-[14rem]"></div>
            </div>
            {/* Outgoing Message */}
            <div className="flex justify-end">
              <div className="bg-gray-300 rounded-xl p-4 w-[14rem]"></div>
            </div>
            {/* Repeat skeleton messages as needed */}
          </div>
        </div>
  
        {/* Footer */}
        <div className="border-t border-gray-500">
          <div className="p-4 flex items-center justify-between">
            {/* Left Icon */}
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
  
            {/* Input Box */}
            <div className="flex items-center w-full mx-3 border bg-gray-300 rounded-full px-4 py-2">
              <div className="w-full h-4 bg-gray-300 rounded"></div>
            </div>
  
            {/* Right Icons */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  