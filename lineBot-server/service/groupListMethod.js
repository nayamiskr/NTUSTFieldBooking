import { client } from "./apiService.js";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDisplayDate = (startStr) => {
  const start = new Date(startStr);

  const mm = String(start.getMonth() + 1).padStart(2, "0");
  const dd = String(start.getDate()).padStart(2, "0");

  return `${mm}/${dd}`;
};

// service/groupListMethod.js

const formatDisplayTime = (startStr, endStr) => {
  const start = new Date(startStr);
  const end = new Date(endStr);

  const startH = String(start.getHours()).padStart(2, "0");
  const startM = String(start.getMinutes()).padStart(2, "0");
  const endH = String(end.getHours()).padStart(2, "0");
  const endM = String(end.getMinutes()).padStart(2, "0");

  return `${startH}:${startM} - ${endH}:${endM}`;
};

const getLocationById = async (id) => {
  const response = await client.get(`/locations/${id}`);
  return response.data;
};

// 實作取得臨打團資料
export const getGroups = async (userLat, userLon, hostName = null) => {
  const response = await client.get("/pickup-groups");
  let items = response.data.items;

  if (hostName) {
    items = items.filter((group) => group.host_name === hostName);
  }

  const groups = await Promise.all(
    items.map(async (group) => {
      const location = await getLocationById(group.location_id);

      return {
        ...group,
        location: location,
        date: formatDisplayDate(group.start_time),
        time: formatDisplayTime(group.start_time, group.end_time),
        distance: calculateDistance(
          userLat,
          userLon,
          location.latitude,
          location.longitude,
        ),
      };
    }),
  );

  if (userLat && userLon) {
    groups.sort((a, b) => {
      return a.distance - b.distance;
    });
  }

  return groups;
};

export const getHostLists = async () => {
  const response = await client.get("/pickup-groups");
  const groups = response.data.items;
  const hostList = groups.reduce((acc, group) => {
    const host = group.host_name;

    if (!acc[host]) {
      acc[host] = [];
    }
    acc[host].push(group);
    return acc;
  }, {});

  return hostList;
};

export const addGroup = async (groupId) => {
  try {
    const response = await client.post(`/pickup-groups/${groupId}/orders`);
    return response.data;
  } catch (error) {
    console.error("Error joining group:", error);
    throw error;
  }
};
