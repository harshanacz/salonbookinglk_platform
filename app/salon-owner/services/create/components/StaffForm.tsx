export default function StaffForm() {
    const staff = [
      { name: "Shamila", role: "Hair Dresser", image: "/staff1.jpg" },
      { name: "Shamila", role: "Hair Dresser", image: "/staff2.jpg" },
    ];
  
    return (
      <div className="mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {staff.map((person, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <img
                src={person.image}
                alt={person.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="text-center">
                <p className="font-medium">{person.name}</p>
                <p className="text-sm text-gray-500">{person.role}</p>
              </div>
              <button className="text-red-500 text-sm">−</button>
            </div>
          ))}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-36">
            <p className="text-2xl font-medium">+</p>
            <p className="text-sm text-gray-500">Add</p>
          </div>
        </div>
      </div>
    );
  }
  