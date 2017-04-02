### Each file in 'financial aid' directory contains specific rules.

* `aid_duplicate.json`: This file shows the financial aid data from colleges that have **duplicate name**. For example, there are 2 universities name Anderson. One located in Anderson, Indiana. The other located in Anderson, South Carolina.

* `aid_link_broken.json`: We turn college names into query string to search on CollegeBoard, for example: Bates College ---> bigfuture.collegeboard.org/college-university-search/bates-college. But sometimes college name doesn't match this convention, such as: Asbury University doesn't work. The right name on CollegeBoard is Asbury College. Or /depauw-university is broken link, we must search: /de-pauw-university, ... Errors range from backtick: D'Youville, incorrect words: Asbury *University*, to duplicate name: Augustana College and false format to use algorithms: McPherson (correct format is Mc Pherson). This file aims to fix these little annoying mistakes.

* `aid_unique.json`: contains colleges that have unique name on CollegeBoard. It hosts 90% of total colleges we queried.

* `common_data_set.json`: Some colleges don't have international student aid infomation on CollegeBoard. We must get data from Common Data Set on their websites. This file contains 81 colleges.

* `final_aid_info.json`: The offical data package we would use after merging 4 files above in beautiful JSON format.
