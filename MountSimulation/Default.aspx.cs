using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using RestSharp;


namespace MountSimulation
{
    public partial class WebForm1 : System.Web.UI.Page
    {
        //replace with your own comsumer key and secret
        const String consumerKey = "";
        const String secretKey = "";
        const String strAgigee = "https://developer.api.autodesk.com";

        RestClient _client = new RestClient(strAgigee);
        String _token = "";

        string inputDocumentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGVzdG53eHh4L0V4YW1wbGUubndk";


        protected void Page_Load(object sender, EventArgs e)
        { 
            if (Request.QueryString["myurn"] != null)
                inputDocumentId = Request.QueryString["myurn"].ToString();

            authentication();
        }

        public string GetToken()
        {
            return _token;
        }
        public string GetDocumentId()
        {
            string docId;
            if (!inputDocumentId.StartsWith("urn:"))
            {
                docId = "urn:" + inputDocumentId;
            }
            else
            {
                docId = inputDocumentId;
            }

            return docId;

        }

        bool authentication()
        {
            RestRequest authReq = new RestRequest();
            authReq.Resource = "authentication/v1/authenticate";
            authReq.Method = Method.POST;
            authReq.AddHeader("Content-Type", "application/x-www-form-urlencoded");
            authReq.AddParameter("client_id", consumerKey);
            authReq.AddParameter("client_secret", secretKey);
            authReq.AddParameter("grant_type", "client_credentials");

            IRestResponse result = _client.Execute(authReq);
            if (result.StatusCode == System.Net.HttpStatusCode.OK)
            {
                String responseString = result.Content;
                int len = responseString.Length;
                int index = responseString.IndexOf("\"access_token\":\"") + "\"access_token\":\"".Length;
                responseString = responseString.Substring(
                    index, len - index - 1);
                int index2 = responseString.IndexOf("\"");
                _token = responseString.Substring(0, index2);
                viewertoken.Value = _token;
                return true;

            }
            return false;

        }
    }
}