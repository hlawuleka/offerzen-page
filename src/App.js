import "./styles.scss";
import { useState } from 'react';
import { Header } from './Header';
import people from './data/people.json';
import moment from 'moment';

export default function App() {
  const DESC = true;
  const CURRENCY = 'R';
  
  const [showArchived, setToggleArchived] = useState(true);
  const [searchFiltered, setFilteredPeople] = useState(people);

  const tableHeaderData = [
    'Candidate',
    'Role',
    'Last communication',
    'Salary',
    'Sent by',
    '',
  ];
  // Tasks
  /**
    1. Archive function = done
    2. Mark archive function  = done
    3. Search by name function = done
    4. Sort by date function = done
   */
  const toggleArchived = 
  (initial) => {
    if (initial || showArchived) {
      setToggleArchived(false);
    }

    if (initial || !showArchived) {
      setToggleArchived(true);
    }

    setFilteredPeople(people.filter( person => {
      if (showArchived ) return person.archived;
      return people;
    }));
  }


  const markItemAsArchived = (personName) => {
    const getPersonIndex = people.findIndex( item => item.candidate == personName);
    if (getPersonIndex >= 0) {
      people[getPersonIndex].archived = !people[getPersonIndex].archived;
    }

    setFilteredPeople([...people]);
  }

  const searchFilter = (term) => {
    let filteredResults = []
    const searchTerm = term.target.value.split(' ').join('') || '';

    if (searchTerm) {
      let finalConcat = '';
      // Create search permutation
      // Permutation formula: get current item from split array
      // For each of the items, iterate over entire split array and join current item with each sibling item
      people.map( person => {
        const splitPersonName = person.candidate.split(' ');
        
        for (let i = 0; i < splitPersonName.length; i++) {
           // forward concat, ignore 0? Maybe
          for (let j = 0; j < splitPersonName.length; j++) {
            finalConcat += `${splitPersonName[i] + '' + splitPersonName[j]}`;
          }
          
        }       
        person.modifiedCandidate = finalConcat.toLowerCase();
        finalConcat = '';
      }); 

      filteredResults = people.filter( person => person.modifiedCandidate.indexOf(searchTerm.toLowerCase()) >= 0);
      ;

      setFilteredPeople(filteredResults || []);
    } else {
      setFilteredPeople(people);
    }
  }

  const transorfmedPersons = () => {
    people.map( (person, index) => {
      const TODAY = moment().clone().startOf('day');
      const YESTERDAY = moment().clone().subtract(1, 'days').startOf('day');
      const personDateRef = moment(person.last_comms.date_time);

      person.displayDate = moment(personDateRef).format('DD/MM/YYYY');
      if (personDateRef.isSame(TODAY, 'd')) {
        person.displayDate = moment(personDateRef).format('H:mma');
      }

      if (personDateRef.isSame(YESTERDAY, 'd')) {
        person.displayDate = 'Yesterday';
      }
    });

    searchFiltered.sort( ( x, y) => Number(moment(x.last_comms.date_time).unix()) > Number(moment(y.last_comms.date_time).unix()) ? -1 : 1
    );
  }

  transorfmedPersons();

  return (
    <div className="App">
      <Header />
      <div className="filters-section">
        <div className="filter-item search">
          <input onChange={(e) => searchFilter(e)} type="text" name="search_filter" placeholder="Search" />
        </div>
        <div className="filter-item archive">
          <p>Show archive</p>
          <div onClick={() => toggleArchived(false)} className="toggle-box">T</div>
        </div>
      </div>
      
      {!searchFiltered.length && 
        (
          <div className="empty-results">
          Uh, man! We could not find what you are looking for. Give it another try!
          <img src="https://assets.website-files.com/5e8b2955eaa7857dbbd850ad/6076f27179ff5a7f1c30f22f_dino-step-2.svg" />
          </div>
        )
      }
      {searchFiltered.length >= 1 && (
        <>
          <div className="table">
          <p className="total-interviews">{searchFiltered.length} interview request{ searchFiltered.length > 1 ? 's' : '' }</p>
          <div className="table-content">
            <div className="table-header">
              {
                tableHeaderData.map( data => (<div key={data} className="header-data">{data}</div>))
              }
            </div>

            <div className="table-data">
              {
                searchFiltered.map( person => 
                  (
                    <div key={person.candidate} className={`${person.archived ? 'archived' : ''} person-details`}>
                      <div className="details-data details-name">
                        <img src={person.image} />
                        {person.candidate}
                      </div>
                      <div className="details-data details-role">{person.role || '-'}</div>
                      <div className="details-data details-description">
                        
                        {person.last_comms.unread && <span className="details-unread"></span>}{person.last_comms.description}
                        <span className="details-date">{person.displayDate}</span>
                      </div>
                      <div className="details-data details-salary">{`${CURRENCY + person.salary}`}</div>
                      <div className="details-data details-sentby">{person.sent_by}</div>
                      <div onClick={() => markItemAsArchived(person.candidate)} className="details-data details-archived">{person.archived ? ' Unarchive' : 'Archive'}</div>
                    </div>
                  )
                )
              }
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
