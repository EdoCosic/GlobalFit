import { Routes } from '@angular/router';
import { Home } from "../features/home/home";
import { MemberList } from '../features/members/member-list/member-list';
import { MemberDetailed } from '../features/members/member-detailed/member-detailed';
import { Lists } from '../features/lists/lists';
import { Messages } from '../features/messages/messages';
import { Membership } from '../features/membership/membership';
import { Program } from '../features/program/program';
import { Shop } from '../features/shop/shop';
import { Reviews } from '../features/reviews/reviews';

export const routes: Routes = [
    {path:'',component: Home},
    {path:'membership',component: Membership},
    {path:'program',component: Program},
    {path:'shop',component: Shop},

    {path:'news',component: Messages},
    {path:'reviews',component: Reviews},


    {path:'members',component: MemberList}, //ne koristi se nez hocu li koristi jos uvijek ( nek stoji za sad)
    {path:'members/:id',component: MemberDetailed}, //ne koristi se nez hocu li koristi jos uvijek ( nek stoji za sad)
    {path:'lists',component: Lists}, //ne koristi se nez hocu li koristi jos uvijek ( nek stoji za sad)

    {path:'**',component: Home},
];
