using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using System.Web.UI;
using System.Web.UI.WebControls;
using RestSharp;


namespace MountSimulation
{
    public partial class WebForm1 : System.Web.UI.Page
    {
        //view base url
        static String baseUrl = WebConfigurationManager.AppSettings["ViewerBaseURL"];
        // Viewing Service client key
        static String _clientKey = WebConfigurationManager.AppSettings["ViewerClientKey"];
        // Viewing service client secret
        static String _secretKey = WebConfigurationManager.AppSettings["ViewerSecretKey"];
        //default urn
        static String _defaultURN = WebConfigurationManager.AppSettings["ViewerDefaultURN"];


        RestClient _client = new RestClient(baseUrl);
        
     
        protected void Page_Load(object sender, EventArgs e)
        { 
            authentication();
            viewerDefaultURN.Value = _defaultURN;
        }
 
        // authenticate and produce the token
        bool authentication()
        {
            RestRequest authReq = new RestRequest();
            authReq.Resource = "authentication/v1/authenticate";
            authReq.Method = Method.POST;
            authReq.AddHeader("Content-Type", "application/x-www-form-urlencoded");
            authReq.AddParameter("client_id", _clientKey);
            authReq.AddParameter("client_secret", _secretKey);
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
                
                //store the token to the control of web page.
                viewertoken.Value = responseString.Substring(0, index2); ;
                return true;

            }
            return false;

        }
    }
}