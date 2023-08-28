import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";

const [audienceWH_InitPP, setAudienceWH_InitPP] = useState<IAudienceWH[]>([]);
const [audienceWH, setAudienceWH] = useState<IAudienceWH[]>([]);

const configAudienceFromPeoplePicker = async (
  selectedGroups: IAudienceWH_PPickerGroup[]
) => {
  //console.log('murch: configAudienceFromPeoplePicker: selectedGroups: ', selectedGroups)

  const local_audiences: IAudienceWH[] = selectedGroups.map((group) => {
    if (group.secondaryText !== "TenantAllUsers") {
      const retObj: IAudienceWH = {
        id_GroupInGraph: "",
        id_GroupInUserInfo: -1,
        ppicker_group: group,
      };

      return retObj;
    }
  });

  // recupera o id do grupo no UserInfo para cada grupo selecionado
  for (let x = 0; x <= local_audiences.length - 1; x++) {
    if (local_audiences[x].id_GroupInUserInfo < 0) {
      const loginName = local_audiences[x].ppicker_group.loginName;

      let groupData = await getDataFromGroupInUserInfo(loginName, "BYLOGIN");

      // console.log("Group Data 1", groupData);

      // console.log('configAudienceFromPeoplePicker: id_GroupInUserInfo: ', id_GroupInUserInfo);

      if (groupData.id_GroupInUserInfo === 0) {
        // adiciona o grupo no UserInfo e pesquisa o novo id. Se nao achar, mantem como -1

        //console.log('configAudienceFromPeoplePicker: Adicionando grupo ao UserInfo');

        let user;
        let users;

        try {
          user = await sp.web.ensureUser(loginName);
        } catch (e) {
          console.log(
            "configAudienceFromPeoplePicker: Erro ao executar ensureUser: " +
              e.message
          );
        }

        try {
          users = await sp.web.siteUsers;
        } catch (e) {
          console.log(
            "configAudienceFromPeoplePicker: Erro ao obter siteUsers: " +
              e.message
          );
        }

        try {
          await users.add(user.data.LoginName);
        } catch (e) {
          console.log(
            "configAudienceFromPeoplePicker: Erro ao adicionar usuario no UserInfo: " +
              e.message
          );
        }

        const groupData2 = await getDataFromGroupInUserInfo(
          loginName,
          "BYLOGIN"
        );

        // console.log("Group Data 2", groupData2);

        if (groupData2.id_GroupInUserInfo === 0) {
          groupData2.id_GroupInUserInfo = -1;
        }

        groupData = groupData2;
        // console.log('configAudienceFromPeoplePicker: id_GroupInUserInfo2: ', id_GroupInUserInfo2);
      }

      // eslint-disable-next-line require-atomic-updates
      local_audiences[x].id_GroupInUserInfo = Number(
        groupData.id_GroupInUserInfo
      );
    }
  }

  //console.log('configAudienceFromPeoplePicker: Audiencia definida:')
  // console.log("local_audiences", local_audiences);
  
  setAudienceWH_InitPP(local_audiences);
  setAudienceWH(local_audiences);
};

async function initAudience(idsAudienceItem: string[]) {
  if (idsAudienceItem === null) {
    idsAudienceItem = [];
  }

  let local_audiences: IAudienceWH[] = idsAudienceItem?.map(
    (id_GroupInUserInfo) => {
      let retObj: IAudienceWH = {
        id_GroupInGraph: "",
        id_GroupInUserInfo: parseInt(id_GroupInUserInfo),
        ppicker_group: null,
      };
      return retObj;
    }
  );

  for (let x = 0; x <= local_audiences?.length - 1; x++) {
    let id_GroupInUserInfo = local_audiences[x].id_GroupInUserInfo.toString();
    let groupData = await getDataFromGroupInUserInfo(
      id_GroupInUserInfo,
      "BYID"
    );

    // console.log("murch: initAudience: groupData", groupData);

    // Caso seja um grupo que nao tem o SecondaryText, entao monta um com outros dados
    // para poder aparecer no PeoplePicker
    let outSecondaryText = "";
    if (groupData.secondaryText == "") {
      outSecondaryText = groupData.text;
    } else {
      outSecondaryText = groupData.secondaryText;
    }

    const local_ppicker_group: IAudienceWH_PPickerGroup = {
      id: groupData.loginName,
      loginName: groupData.loginName,
      imageInitials: "",
      text: groupData.text,
      secondaryText: outSecondaryText,
    };

    local_audiences[x].ppicker_group = local_ppicker_group;
  }

  //console.log('initAudience: Audiencia carregada:', local_audiences);
  setAudienceWH_InitPP(local_audiences);
}

async function getDataFromGroupInUserInfo(searchTerm: string, tipo: string) {
  let groupData;

  if (tipo === "BYLOGIN") {
    groupData = await sp.web.siteUsers
      .getByLoginName(searchTerm)()
      .then((I) => {
        return {
          id_GroupInUserInfo: I.Id,
          loginName: I.LoginName,
          secondaryText: I.Email,
          text: I.Title,
        };
      })
      .catch((e) => {
        console.log(
          "getDataFromGroupInUserInfo: BYLOGIN: Grupo nao encontrado no UserInfo: " +
            searchTerm
        );
        return {
          id_GroupInUserInfo: 0,
          loginName: "",
          secondaryText: "",
          text: "",
        };
      });
  }

  if (tipo === "BYID") {
    groupData = await sp.web.siteUsers
      .getById(parseInt(searchTerm))()
      .then((I) => {
        return {
          id_GroupInUserInfo: I.Id,
          loginName: I.LoginName,
          secondaryText: I.Email,
          text: I.Title,
        };
      })
      .catch((e) => {
        console.log(
          "getDataFromGroupInUserInfo: BYID: Grupo nao encontrado no UserInfo: " +
            searchTerm
        );
        return {
          id_GroupInUserInfo: searchTerm,
          loginName: "",
          secondaryText: "",
          text: "",
        };
      });
  }

  return groupData;
}

const getVideos_ByCAML = async (): Promise<void> => {
  const CAML = await buildCAML_Images_WP(
    props.audience,
    props.displayMode,
    500,
    props.context,
    simple.ListItemID
  );

  const list = sp.web.lists.getByTitle("SimpleBanner");

  const item = await list.getItemsByCAMLQuery({
    ViewXml: CAML,
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  initAudience(item[0]?.OData__ModernAudienceTargetUserFieldId);
};

useEffect(() => {
  getVideos_ByCAML();
}, []);
  
<PeoplePicker
  context={props.context}
  titleText={"Audience"}
  personSelectionLimit={50}
  showtooltip={false}
  ensureUser={false}
  principalTypes={[PrincipalType.SecurityGroup]}
  onChange={(items: any[]) => {
    configAudienceFromPeoplePicker(items);
  }}
  resolveDelay={1000}
  defaultSelectedUsers={audienceWH_InitPP?.map(
    (audienceItem: any) => audienceItem.ppicker_group.text
  )}
/>;  
