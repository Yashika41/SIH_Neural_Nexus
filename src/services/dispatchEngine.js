/**
 * AI Auto-Dispatch Engine
 * Matches placed customer orders with the best available fleet based on
 * payload capacity, ground clearance, hill suitability, and accessibility requirements.
 */

export function autoDispatchOrder(order, vehicles) {
  if (!vehicles || vehicles.length === 0) return null;

  // Filter available vehicles that have sufficient payload capacity
  const eligibleVehicles = vehicles.filter(
    (v) => (v.status === 'Available' || v.status === 'Delivering') && v.capacity >= order.weight
  );

  if (eligibleVehicles.length === 0) {
    // Fallback to highest capacity vehicle if none strictly available
    return vehicles[0];
  }

  // Score vehicles based on requirements
  let bestVehicle = eligibleVehicles[0];
  let highestScore = -Infinity;

  const reqSet = new Set(order.accessibilityRequirements || []);

  eligibleVehicles.forEach((v) => {
    let score = 50;

    // Accessibility capability scoring
    if (reqSet.has('Wheelchair Accessible') && (v.accessibilityCapability === 'Wheelchair Lift' || v.accessibilityCapability === 'Ramp')) {
      score += 40;
    }
    if (reqSet.has('Low-Floor Vehicle Required') && v.accessibilityCapability === 'Ramp') {
      score += 30;
    }

    // Hill and ground clearance scoring
    if (v.hillSuitability === 'Excellent') score += 25;
    if (v.hillSuitability === 'Good') score += 15;
    if (v.groundClearance >= 220) score += 20;

    // Battery / Fuel charge scoring
    score += (v.fuelCharge || 80) * 0.2;

    if (score > highestScore) {
      highestScore = score;
      bestVehicle = v;
    }
  });

  return bestVehicle;
}
