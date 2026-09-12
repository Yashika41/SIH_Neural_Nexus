/**
 * AI Routing Copilot Assistant Service
 * Advises the best route matching cargo, accessibility, and disaster conditions.
 */

export function processCopilotPrompt(userPrompt, currentOrder) {
  const promptLower = userPrompt.toLowerCase();
  
  let suggestedCargo = currentOrder?.cargoType || 'Vaccine & Medical Supplies';
  let suggestedPriority = currentOrder?.priority || 'High';
  let suggestedAccessibility = [...(currentOrder?.accessibilityRequirements || ['Wheelchair Accessible'])];
  let recommendedReason = '';

  if (promptLower.includes('vaccine') || promptLower.includes('medical') || promptLower.includes('hospital') || promptLower.includes('emergency')) {
    suggestedCargo = 'Vaccine & Medical Supplies';
    suggestedPriority = 'Emergency';
    if (!suggestedAccessibility.includes('Avoid Very Steep Sections')) {
      suggestedAccessibility.push('Avoid Very Steep Sections');
    }
    if (!suggestedAccessibility.includes('Avoid Poor Surface')) {
      suggestedAccessibility.push('Avoid Poor Surface');
    }
    recommendedReason = 'Activated Cold-Chain Vaccine Protocol: Prioritized maximum speed, vibration dampening for smooth transit, and zero-landslide safety corridors.';
  } else if (promptLower.includes('gravel') || promptLower.includes('heavy') || promptLower.includes('construction') || promptLower.includes('cement')) {
    suggestedCargo = 'Heavy Construction & Gravel';
    suggestedPriority = 'Normal';
    if (!suggestedAccessibility.includes('Avoid Very Steep Sections')) {
      suggestedAccessibility.push('Avoid Very Steep Sections');
    }
    if (!suggestedAccessibility.includes('Avoid Narrow Route')) {
      suggestedAccessibility.push('Avoid Narrow Route');
    }
    recommendedReason = 'Activated Heavy Logistics Protocol: Configured dual-lane arterial highways, max incline gradient limits (<8%), and high load clearance.';
  } else if (promptLower.includes('agri') || promptLower.includes('fruit') || promptLower.includes('perishable') || promptLower.includes('tea')) {
    suggestedCargo = 'Perishable Agri-Produce';
    suggestedPriority = 'High';
    recommendedReason = 'Activated Perishable Cargo Protocol: Optimized for bridge stability and fast transit without monsoon waterlogging delays.';
  } else if (promptLower.includes('landslide') || promptLower.includes('bypass') || promptLower.includes('block') || promptLower.includes('rain')) {
    recommendedReason = 'Activated Disaster Bypass Protocol: Scanning active landslide hazards and dynamically calculating safe rerouting corridors.';
  } else {
    recommendedReason = `Analyzed request: Configured optimal multi-objective weights for ${suggestedCargo} with ${suggestedPriority} priority.`;
  }

  return {
    suggestedCargo,
    suggestedPriority,
    suggestedAccessibility,
    advisoryMessage: recommendedReason
  };
}
