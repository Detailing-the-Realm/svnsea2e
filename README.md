# 7th Sea Second Edition System (Unofficial)

## Roleplaying System
[7th Sea](https://www.chaosium.com/7th-sea/) is a tabletop roleplaying game of swashbuckling and intrigue, exploration and adventure, taking place on the continent of Théah, a land of magic and mystery inspired by our own Europe.

Players take on the roles of heroes thrown into global conspiracies and sinister plots, exploring ancient ruins of a race long vanished and protecting the rightful kings and queens of Théah from murderous villains. It is a world of sharp blades and sharp wits, where a cutting retort can be just as deadly as a sword’s point.

## Usage

Because 7th Sea Second Edition doesn't have an SRD or anything other than the quick start the system lacks compendiums. GMs will need to create all of the advantages, backgrounds and other items they want to use for character creation.

### Item Creation
Items will make character, villain and ship creation simpler because each sheet supports drag and drop items. Some items have interdependance on each other and some are more complex to create than others. Below each item is described.

Each item has an image associated with the item, that can be changed, a name, source location for reference, and a description.

#### Advantages
![advantages description tab](https://user-images.githubusercontent.com/1393032/97647625-1ac48480-1a29-11eb-9ee3-01993bf3ee72.png)
![advantage details tab](https://user-images.githubusercontent.com/1393032/97647671-3d569d80-1a29-11eb-9b35-5e214177619a.png)
The majority of the information about an advantage is stored in the description. The attributes tab helps to identify advantage's cost, when they have a reduced cost, if they are a knack or innate. The 7th Sea books will contain this information.

#### Backgrounds

![background details tab](https://user-images.githubusercontent.com/1393032/97647872-b0f8aa80-1a29-11eb-9c3a-e258934582a7.png)
Backgrounds are more complex because they have skills and advantages associated with them. The description and quirks tabs contain text fields to enter the text from the books into. The Details tab is where a GM would select the skills a hero gains when taking the background as well as the advantages. A GM clicks on the edit icon on the right side to bring up the list of skills or advantages.

![background advantage selector](https://user-images.githubusercontent.com/1393032/97647999-0765e900-1a2a-11eb-8b2f-084999403cda.png)

The advantage list is based on the advantages created in the item directory or in compendiums. I recommend taking the time and adding as many advantages as you have in your books before creating backgrounds. When associating advantages to backgrounds I use the advantages name to look up its id. The id to the global advantage is what is stored. Problems may occur if an advantage is checked in the list and then deleted from the directory or compendium. If an advantage is deleted and recreated the background will need to be modified before being assigned to the character. If a background has already been assigned it may not deleted.

When a background is dragged to a character (player, hero, or villain) all associated advantages are looked up and copied to the character. All skills selected with the background are also increased by 1. If a background is removed then the system attempts to remove the associated advantages and decrease all skills associated with the background by 1.

#### Dueling Styles

![dueling styles descrioption tab](https://user-images.githubusercontent.com/1393032/97648346-e0f47d80-1a2a-11eb-8bc2-e3c4504135f8.png)

Dueling styles uses two fields to describe the style.

#### Monster Qualities
![monster qualities](https://user-images.githubusercontent.com/1393032/97648414-0ed9c200-1a2b-11eb-88b0-fa35b402e18b.png)
Monster qualities are a basic description that can be used to make creating monster quicker.

#### Secret Society
![isecret society](https://user-images.githubusercontent.com/1393032/97648469-3761bc00-1a2b-11eb-97d9-b74d06094440.png)
The Secret Society has tabs for the descripton of each aspect of a secret society. There is also a favor field in the header the is used by the players to track how much favor they have with the secret society.

#### Ships Adventures and Ships Backgrounds
These are both simple descriptions of what the benefit is to the ship and are intended to make it easier to add to ships.

#### Sorcery
![sorcery sheet](https://user-images.githubusercontent.com/1393032/97648590-8b6ca080-1a2b-11eb-8c13-d765882544df.png)

Sorcery is a difficult item to deal with because each sorcery is different. I focused sorcery on the major and minor effects that a sorcery can perform based on what they choose. Sorceries have the following attributes:

* Type: the overall name for the sorcery used to group that the major or minor effects.
* Category: the grouping of effects used in the sorcery description in the books.
* Sub-category: the secondary term if used to describe the effect in the books.
* Duration: how long the effect lasts if it is specificed.

#### Stories
![story sheet](https://user-images.githubusercontent.com/1393032/97648968-7e03e600-1a2c-11eb-985f-1203d9fd6ac1.png)

Stories are a type best created in the player character sheet and not added to the Item directory. Each story is personal to the character and typically not generic. Each story has a status to let players create stories before they are started and retain them after they are completed.

### Player Character Creation
![Example character sheet](https://user-images.githubusercontent.com/1393032/97647289-3ed39600-1a28-11eb-8d1b-cd56bba8b168.png)

### Brute Creation
![brute sheet](https://user-images.githubusercontent.com/1393032/97649087-d33ff780-1a2c-11eb-8475-3b1a5cdc53c0.png)

### Villan Creation
![villain sheet](https://user-images.githubusercontent.com/1393032/97649247-3a5dac00-1a2d-11eb-9979-5fa8fabec7d7.png)

### Monster creation
![monster sheet](https://user-images.githubusercontent.com/1393032/97649150-f8346a80-1a2c-11eb-8945-73e0da7f8eef.png)

### Ship Creation
![ship sheet](https://user-images.githubusercontent.com/1393032/97649212-231ebe80-1a2d-11eb-927f-e304dcce6b9b.png)

### Danger Points
![danger points](https://user-images.githubusercontent.com/1393032/97649281-53665d00-1a2d-11eb-8b9c-c629d51a025d.png)

## Contributing

This project uses the Vite build tool and Yarn. If you want to get started contributing you can follow these steps:

1. Run `yarn install` to install dependencies.
2. Run `yarn build` to build the project, this will bundle the system up into the `dist` folder.
3. Copy `foundryconfig.json.example` to `foundryconfig.json` and edit the `dataPath` to point to your, for example on Windows it might be: `C:\\Users\\Me\\AppData\\Local\\FoundryVTT`
4. Run `yarn link-package` to link the compiled `dist` folder to your Foundry installation.
5. Run `yarn serve` to start the Dev Server up.
6. Now you should be able to go to `http://localhost:30001` which proxies the Foundry port 30000 to do reloading while you edit.

## Credits
Developed from then [FoundryVTT System Tutorial](https://gitlab.com/asacolips-projects/foundry-mods/foundryvtt-system-tutorial). With code and ideas from DnD5E System also by Atropos.

This FoundryVTT System uses trademarks and/or copyrights owned by Chaosium Inc/Moon Design Publications LLC, which are used under Chaosium Inc’s Fan Material Policy. We are expressly prohibited from charging you to use or access this content. This FoundryVTT system is not published, endorsed, or specifically approved by Chaosium Inc. For more information about Chaosium Inc’s products, please visit [www.chaosium.com](www.chaosium.com).
