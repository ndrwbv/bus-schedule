import React from "react";
import defaultSchedule from "../consts/schedule";
import { AndrewLytics } from "../helpers";

const useSchedule = () => {
  const [SCHEDULE, setSchedule] = React.useState(defaultSchedule);

  React.useEffect(() => {
    fetch(
      "https://cdn.contentful.com/spaces/jms7gencs5gy/environments/master/entries/43nolroEBc5PNSMub6VR8G?access_token=qhkzg59i5IhlhFYUg-N4Pc9Qm1Dfx63wlGkOwOGhPXg"
    )
      .then((res) => res.json())
      .then((res) => {
        if (res?.fields?.schedule) {
          setSchedule(res?.fields?.schedule);
        } else {
          AndrewLytics("cannotLoad");
        }
      })
      .catch(() => {
        AndrewLytics("cannotLoad");
      });
  }, []);

  return {
    SCHEDULE,
  };
};

export default useSchedule;
