/* eslint-disable @typescript-eslint/no-explicit-any */
import { spfi, SPFx as spSPFx } from "@pnp/sp";
import { graphfi, SPFx as graphSPFx } from "@pnp/graph";
import "@pnp/graph/users";

export const buildCAML = async (
  useAudience: boolean,
  displayMode: number,
  rowLimit: number,
  theContext: any,
  id: number
): Promise<string> => {
  let Where = `<Eq><FieldRef Name='ID' /><Value Type='Counter'>${id}</Value></Eq>`;
  let camlAudience = ``;

  if (useAudience && displayMode === 1) {
    const sp = spfi().using(spSPFx(theContext));
    const graph = graphfi().using(graphSPFx(theContext));

    // recupera grupos do usuario
    const GraphCurrentUserGroups = await graph.me.getMemberGroups();
    // console.log("murch: GraphCurrentUserGroups", GraphCurrentUserGroups);

    const oGroups = await Promise.all(
      GraphCurrentUserGroups.map(async (item) => {
        return await sp.web.siteUserInfoList.getItemsByCAMLQuery({
          ViewXml: `<View><Query><Where><Eq><FieldRef Name='_AadObjectIdForUser' /><Value Type='Guid'>${item}</Value></Eq></Where></Query></View>`,
        });
      })
    ).then((all) => {
      const gs = [] as any;
      all.map((g) => {
        g.map((o: any) => {
          gs.push(o);
        });
      });
      return gs;
    });
    camlAudience = `<IsNull><FieldRef Name='_ModernAudienceAadObjectIds' /></IsNull>`;

    // console.log("murch: oGroups", oGroups);

    for (let I: number = oGroups.length - 1; I >= 0; I--) {
      const nameSplit = oGroups[I].Name.split("|");
      camlAudience = `<Or><Contains><FieldRef Name='_ModernAudienceAadObjectIds' /><Value Type='LookupMulti'>${
        nameSplit[nameSplit.length - 1]
      }</Value></Contains>${camlAudience}</Or>`;
    }
    Where = `<Where><And>${Where}${camlAudience}</And></Where>`;
  } else {
    Where = `<Where>${Where}</Where>`;
  }

  return `<View><Query>${Where}</Query><RowLimit>${rowLimit}</RowLimit></View>`;
};
