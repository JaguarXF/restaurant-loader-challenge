import { RestaurantDetails, Menu } from "./models";

// Mocked service for Anaylsis
// In this file, we also implement a simple error logging function that sends errors to an external service.
// In a real app, these would be real API calls to the backend server.
async function logErrorToService(
  error: Error,
  context: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch("https://logs.mrdfood.com/api/v1/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // swallow — avoid recursive error logging
  }
}

export async function fetchRestaurantDetails(
  id: number,
): Promise<RestaurantDetails> {
  try {
    const response = await fetch(
      `https://api.mrdfood.com/exposure/preview/v2/restaurants/${id}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch restaurant details (${response.status} ${response.statusText})`,
      );
    }

    return (await response.json()) as RestaurantDetails;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    await logErrorToService(error, { restaurantId: id });
    throw error;
  }
}

export async function fetchRestaurantMenu(menuId: number): Promise<Menu> {
  try {
    const response = await fetch(
      `https://api.mrdfood.com/exposure/preview/menus/${menuId}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch restaurant menu (${response.status} ${response.statusText})`,
      );
    }

    return (await response.json()) as Menu;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    await logErrorToService(error, { menuId });
    throw error;
  }
}
