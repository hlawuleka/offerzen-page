import "./styles.scss";
import { useState } from "react";
import { Header } from "./Header";
import people from "./data/people.json";
import moment from "moment";

export default function App() {
  const CURRENCY = "R";
  const CLICKABLE_COLUMN_NAME = "Last communication";
  const [showArchived, setToggleArchived] = useState(true);
  const [searchFiltered, setFilteredPeople] = useState(people);
  const [orderDesc, setDateAscending] = useState(false);
  const [toggleArchiveTick, setToggleArchiveTick] = useState("is--inactive");

  const tableHeaderData = [
    "Candidate",
    "Role",
    CLICKABLE_COLUMN_NAME,
    "Salary",
    "Sent by",
    ""
  ];

  const toggleArchived = (initial) => {
    if (initial || showArchived) {
      setToggleArchived(false);
      setToggleArchiveTick("is--active");
    }

    if (initial || !showArchived) {
      setToggleArchived(true);
      setToggleArchiveTick("is--inactive");
    }

    setFilteredPeople(
      people.filter((person) => {
        if (showArchived) return person.archived;
        return people;
      })
    );
  };

  const markItemAsArchived = (personName) => {
    const getPersonIndex = people.findIndex(
      (item) => item.candidate === personName
    );
    if (getPersonIndex >= 0) {
      people[getPersonIndex].archived = !people[getPersonIndex].archived;
    }

    setFilteredPeople([...people]);
  };

  const searchFilter = (term) => {
    let filteredResults = [];
    const searchTerm = term.target.value.split(" ").join("") || "";

    if (searchTerm) {
      let finalConcat = "";
      // Create search permutation
      // Permutation formula: get current item from split array
      // For each of the items, iterate over entire split array and join current item with each sibling item
      people.map((person) => {
        const splitPersonName = person.candidate.split(" ");

        for (let i = 0; i < splitPersonName.length; i++) {
          // forward concat, ignore 0? Maybe
          for (let j = 0; j < splitPersonName.length; j++) {
            finalConcat += `${splitPersonName[i] + "" + splitPersonName[j]}`;
          }
        }
        person.modifiedCandidate = finalConcat.toLowerCase();
        finalConcat = "";
      });

      filteredResults = people.filter(
        (person) =>
          person.modifiedCandidate.indexOf(searchTerm.toLowerCase()) >= 0
      );
      return setFilteredPeople(filteredResults || []);
    } else {
      return setFilteredPeople(people);
    }
  };

  const sortByDate = (columnItem) => {
    if (columnItem === CLICKABLE_COLUMN_NAME) {
      if (orderDesc) {
        setDateAscending(false);
      }

      if (!orderDesc) {
        setDateAscending(true);
      }

      const sortAsc = orderDesc ? -1 : 1;
      const sortDesc = !orderDesc ? -1 : 1;

      searchFiltered.sort((x, y) =>
        Number(moment(x.last_comms.date_time).unix()) >
        Number(moment(y.last_comms.date_time).unix())
          ? sortAsc
          : sortDesc
      );
    }
  };

  const transorfmedPersons = () => {
    people.map((person) => {
      const TODAY = moment().clone().startOf("day");
      const YESTERDAY = moment().clone().subtract(1, "days").startOf("day");
      const personDateRef = moment(person.last_comms.date_time);

      person.displayDate = moment(personDateRef).format("DD/MM/YYYY");
      if (personDateRef.isSame(TODAY, "d")) {
        person.displayDate = moment(personDateRef).format("H:mma");
      }

      if (personDateRef.isSame(YESTERDAY, "d")) {
        person.displayDate = "Yesterday";
      }
    });
  };

  transorfmedPersons();

  return (
    <div className="App">
      <Header />
      <div className="filters-section">
        <div className="filter-item search">
          <input
            onChange={(e) => searchFilter(e)}
            type="text"
            name="search_filter"
            placeholder="Search"
          />
          <svg
            className="search-icon"
            fill="#A6ACAF"
            width="1024"
            height="1024"
            viewBox="0 0 1024 1024"
          >
            <path d="M943.879 871.254l-269.763-269.763c41.504-54.47 64.847-124.507 64.847-199.73 0-186.76-150.446-337.203-337.203-337.203s-337.203 150.446-337.203 337.203c0 186.76 150.446 337.203 337.203 337.203 75.224 0 142.663-23.344 199.73-64.847l269.763 269.763c10.377 10.377 23.344 15.563 36.313 15.563s25.94-5.186 36.313-15.563c20.75-20.75 20.75-51.876 0-72.63zM401.759 635.21c-129.693 0-233.45-103.757-233.45-233.45s103.757-233.45 233.45-233.45c129.693 0 233.45 103.757 233.45 233.45s-103.757 233.45-233.45 233.45z"></path>
          </svg>
        </div>
        <div className="filter-item archive">
          <p>Show archive</p>
          <div
            onClick={() => toggleArchived(false)}
            className={toggleArchiveTick + " toggle-box"}
          >
            <svg
              className="toggle-tick"
              width="1024"
              height="1024"
              viewBox="0 0 1024 1024"
              preserveAspectRatio="xMidYMid meet"
            >
              <path d="M358.859 829.399c-11.584 0-22.656-4.715-30.677-13.035l-191.275-198.144c-16.384-16.939-15.893-43.968 1.067-60.331 16.917-16.341 43.968-15.915 60.309 1.067l160.469 166.229 432.277-450.581c16.299-17.003 43.328-17.557 60.331-1.237 17.003 16.299 17.557 43.328 1.259 60.331l-462.976 482.581c-8.043 8.363-19.115 13.099-30.72 13.12h-0.064z"></path>
            </svg>
          </div>
        </div>
      </div>

      {!searchFiltered.length && (
        <div className="empty-results">
          Uh, man! We could not find what you are looking for. Give it another
          try!
          <img
            alt="logo"
            src="https://assets.website-files.com/5e8b2955eaa7857dbbd850ad/6076f27179ff5a7f1c30f22f_dino-step-2.svg"
          />
        </div>
      )}
      {searchFiltered.length >= 1 && (
        <>
          <div className="table">
            <p className="total-interviews">
              {searchFiltered.length} interview request
              {searchFiltered.length > 1 ? "s" : ""}
            </p>
            <div className="table-content">
              <div className="table-header">
                {tableHeaderData.map((data) => (
                  <div
                    onClick={() => sortByDate(data)}
                    key={data}
                    className={
                      (data === CLICKABLE_COLUMN_NAME ? "sort-item " : "") +
                      (orderDesc === true ? "asc " : "desc ") +
                      "header-data"
                    }
                  >
                    {data}{" "}
                    {data === CLICKABLE_COLUMN_NAME && (
                      <span class="sort-icon">
                        <svg
                          width="5"
                          height="10"
                          viewBox="0 0 5 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M0.0598828 3.59767C-0.0752783 3.80944 0.026787 3.98223 0.288733 3.98223H4.71127C4.97335 3.98223 5.07567 3.81005 4.94012 3.59767L2.74545 0.159059C2.61028 -0.0527107 2.39011 -0.0533287 2.25455 0.159059L0.0598828 3.59767ZM4.94012 6.40233C5.07528 6.19056 4.97321 6.01777 4.71127 6.01777H0.288733C0.0266465 6.01777 -0.0756728 6.18995 0.0598828 6.40233L2.25455 9.84094C2.38972 10.0527 2.60989 10.0533 2.74545 9.84094L4.94012 6.40233Z"
                            fill="#343951"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="table-data">
                {searchFiltered.map((person) => (
                  <div
                    key={person.candidate}
                    className={`${
                      person.archived ? "archived" : ""
                    } person-details`}
                  >
                    <div className="details-data details-name">
                      <img alt="profile_img" src={person.image} />
                      {person.candidate}
                    </div>
                    <div className="details-data details-role">
                      {person.role || "-"}
                    </div>
                    <div className="details-data details-description">
                      {person.last_comms.unread && (
                        <span className="details-unread"></span>
                      )}
                      {person.last_comms.description}
                      <span className="details-date">{person.displayDate}</span>
                    </div>
                    <div className="details-data details-salary">{`${
                      CURRENCY + person.salary
                    }`}</div>
                    <div className="details-data details-sentby">
                      {person.sent_by}
                    </div>
                    <div
                      onClick={() => markItemAsArchived(person.candidate)}
                      className="details-data details-archived"
                    >
                      {person.archived ? " Unarchive" : "Archive"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
