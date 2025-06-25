import { Routes } from '@angular/router';
import {StartComponent} from "./start/start.component";
import {RegisterComponent} from "./register/register.component";
import {LoginComponent} from "./login/login.component";
import {WebsiteComponent} from "./website/website.component";
import {WebsiteAdminComponent} from "./website-admin/website-admin.component";
import {ProfileAdminComponent} from "./profile-admin/profile-admin.component";
import {ProfileComponent} from "./profile/profile.component";
import {ProfilesearchComponent} from "./profilesearch/profilesearch.component";
import {ExternalprofileComponent} from "./externalprofile/externalprofile.component";
import {ProfilesearchAdminComponent} from "./profilesearch-admin/profilesearch-admin.component";
import {ExternalprofileAdminComponent} from "./externalprofile-admin/externalprofile-admin.component";
import {ActivityComponent} from "./activity/activity.component";
import {ActivityRepositoryComponent} from "./activity-repository/activity-repository.component";
import { LeaderboardComponent} from "./leaderboard/leaderboard.component";
import { LeaderboardAdminComponent} from "./leaderboard-admin/leaderboard-admin.component";
import { FriendsListComponent} from "./friends-list/friends-list.component";
import { FriendsListAdminComponent} from "./friends-list-admin/friends-list-admin.component";
import {ElevationVisualizationComponent} from './elevation-visualization/elevation-visualization.component';
import { MapViewComponent } from "./map-view/map-view.component";
import {SocialfeedComponent} from "./socialfeed/socialfeed.component";
import {SocialfeedAdminComponent} from "./socialfeed-admin/socialfeed-admin.component";
import {ActivityVisualizationComponent} from "./activity-visualization/activity-visualization.component";

export const routes: Routes = [
  { path: '', component: StartComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'login', component: LoginComponent},
  { path: 'website', component: WebsiteComponent},
  { path: 'website-admin', component: WebsiteAdminComponent},
  { path: 'profile-admin', component: ProfileAdminComponent},
  { path: 'profile', component: ProfileComponent},
  { path: 'profilesearch', component: ProfilesearchComponent},
  { path: 'externalprofile', component: ExternalprofileComponent},
  { path: 'profilesearch-admin', component: ProfilesearchAdminComponent},
  { path: 'externalprofile-admin', component: ExternalprofileAdminComponent},
  { path: 'activity', component: ActivityComponent},
  { path: 'activity-repository', component: ActivityRepositoryComponent},
  { path: 'elevation-visualization/:id', component: ElevationVisualizationComponent },
  { path: 'map-view/:activityid', component: MapViewComponent },
  { path: 'activity-repository', component: ActivityRepositoryComponent},
  { path: 'leaderboard', component: LeaderboardComponent},
  { path: 'leaderboard-admin', component: LeaderboardAdminComponent},
  { path: 'friends-list', component: FriendsListComponent},
  { path: 'friends-list-admin', component: FriendsListAdminComponent},
  { path: 'socialfeed', component: SocialfeedComponent},
  { path: 'socialfeed-admin', component: SocialfeedAdminComponent},
  { path: 'friends-list-admin', component: FriendsListAdminComponent},
  { path: 'activity-visualization', component: ActivityVisualizationComponent }
];
