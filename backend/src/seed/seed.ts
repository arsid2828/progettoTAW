import { seedAirlines } from "./airlines";
import { seedAirports } from "./airports";
import { seedFlights } from "./flights";
import { seedPlanes } from "./planes";
import { seedSeatTypes } from "./seatTypes";

export const seedAll = async () => {

    
    await seedAirports(); 
    await seedAirlines(); 
    await seedPlanes(); 
    await seedFlights(); 
    await seedSeatTypes();
};